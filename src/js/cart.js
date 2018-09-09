"use strict"

/**
 * Cart class
 */
class Cart {
    /**
     * constructor
     * @param {string} url - JSON url
     * @param {string} delButtonSelector - delete button selector to use in click handler
     * @param {string} addButtonSelector - add button selector to use in click handler
     */
    constructor(options = {}) {
        this.total = 0;
        this.options = {
            url: 'http://localhost:3000/cart/',
            cartProdListID: "#cart-prod-list",
            delButtonSelector: ".prod-del-button",
            numSelector: ".pord-num",
            addButtonSelector: ".add-button",
        };
        Object.assign(this.options, options);

        this.initHandlers();
    }

    /**
     * inits all needed handlers
     */
    initHandlers() {
        $(this.options.cartProdListID).on('click', this.options.delButtonSelector, (e) => {
            const goodID = $(e.currentTarget).attr('data-id');
            this.delete(goodID);
            e.preventDefault();
        });

        $(this.options.cartProdListID).on('change', this.options.numSelector, (e) => {
            const elem = e.target;
            const goodID = elem.getAttribute('data-id');
            const quantity = +elem.value;
            this.changeQuantity(goodID, quantity);
            e.preventDefault();
        });
    }

    /**
     * Renders list of products
     * 
     */
    renderProdList() {
        const $div = $(this.options.cartProdListID);
        $div.empty();
        $.get(this.options.url, {}, (goods) => {
            goods.forEach((item) => {
                $div.append(
                    $('<div />', {
                        class: 'prod-list-row border-b'
                    })
                    .append(
                        $('<figure />', {
                            class: 'prod-list-description'
                        })
                        .append(
                            $('<a />', {
                                href: 'singlepage.html'
                            })
                            .append(
                                $('<img />', {
                                    src: 'img/prod-2.jpg',
                                    alt: 'jacket'
                                })
                            ))
                        .append(
                            $('<div />', {
                                class: 'prod-text'
                            })
                            .append(
                                $('<a />', {
                                    href: 'singlepage.html'
                                })
                                .append(
                                    $('<h2 />', {
                                        text: item.name
                                    })
                                )
                            )
                            .append($(`<p>Color: <span>${item.color}</span></p>`))
                            .append($(`<p>Size: <span>${item.size}</span></p>`))
                        )
                    )
                    .append($(`<div class="prod-chars"><p>${item.price}</p></div>`))
                    .append($(`<div class="prod-chars"><input type="text"  class="pord-num" data-id="${item.id}" value="${item.quantity}"></div>`))
                    .append($(`<div class="prod-chars"><p>FREE</p></div>`))
                    .append($(`<div class="prod-chars"><p>$${item.price}</p></div>`))
                    .append($(`<div class="prod-chars"><a href="#" class="del-button" data-id="${item.id}">
                    <p><i class="fas fa-times-circle"></i></p></a></div>`))
                );
            });
        }, 'json');
        this.renderTotal();
    }

    renderTotal() {
        this.total = 0;
        $.get(this.options.url, {}, (goods) => {
            goods.forEach((item) => this.total += +item.quantity * +item.price);
            $('#sub-total').text(`$${this.total}`);
            $('#total').text(`$${this.total}`);
        }, 'json');
    }

    /**
     * Adds comment
     * @param {string} user - user name
     * @param {string} text - review text
     */
    add(user, text) {
        const comment = {
            user: user,
            text: text,
            approved: false
        };
        $.ajax({
            type: 'POST',
            url: this.url,
            data: comment,
            success: () => this.render(),
            error: () => this.showMessage(this.errorSelector, 'Sorry. An error occurred while adding the comment. Try later.', 'Error!'),
        });
    }

    /**
     * Changes goods quantity
     * @param {string} user - user name
     * @param {string} text - review text
     * @param {string} id - comment ID 
     */
    changeQuantity(id, quantity) {
        const url = this.options.url + id;
        const good = {
            id: id,
            quantity: quantity
        };

        if (quantity > 0) {
            $.ajax({
                type: 'PATCH',
                url: url,
                data: good,
                success: () => this.renderTotal(),
                //success: () => this.renderProdList(),
                error: () => console.log("Can't change quantity")
            });
        } else if (quantity == 0) {
            this.delete(id);
        }
    }

    /**
     * Submites comment
     * @param {string} id - comment ID
     */
    submit(id) {
        $.ajax({
            type: 'PATCH',
            url: this.url + id,
            data: {
                quantity: 1
            },
            success: () => this.render(),
            error: () => console.log(`An error occurred while deleting the good #${id}`),
        });
    }

    /**
     * Removes comment
     * @param {string} id - good ID
     */
    delete(id) {
        $.ajax({
            type: 'DELETE',
            url: this.options.url + id,
            success: () => this.renderProdList(),
            error: () => console.log(`An error occurred while deleting the good #${id}`),
        });
    }

}