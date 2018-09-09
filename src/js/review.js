"use strict"

/**
 * Review posting class
 */
class Review {
    /**
     * constructor
     * @param {string} url - JSON url
     * @param {string} errorSelector - error message dialog selector
     */
    constructor(url, errorSelector) {
        this.url = url;
        this.errorSelector = errorSelector;
        this.initHandlers();
    }

    /**
     * inits all needed buttons handlers
     */
    initHandlers() {
        $('#comments').on('click', '.vanish', (e) => {
            const commentID = $(e.target).attr('data-id');
            this.delete(commentID);
            e.preventDefault();
        });

        $('#comments').on('click', '.prove', (e) => {
            const commentID = $(e.target).attr('data-id');
            this.submit(commentID);
            e.preventDefault();
        });

        $('#submit').on('click', (e) => {
            this.add($('#user-name').val(), $('#comment-text').val());
            //this.change($('#user-name').val(), $('#comment-text').val(), $('#comment-id').val());
            e.preventDefault();
        });

    }

    /**
     * Renders review list
     * 
     */
    render() {
        const $div = $('#comments');
        $div.empty();
        $.get(this.url, {}, function (comments) {
            comments.forEach(function (item) {
                const $commentArea = $div.append(
                    $('<div />', {
                        class: 'form-row mt-4 w-100'
                    }));
                $commentArea.append(
                    $('<div />', {
                        class: `alert alert-${$.parseJSON(item.approved) ? 'success' : 'warning'} form-row mt-4 w-100`
                    })

                    .append(
                        $('<div />', {
                            text: 'User name: ' + item.user,
                            class: 'form-group col-md-7'
                        })
                    )
                    .append(
                        $('<div />', {
                            text: 'Comment ID: ' + item.id,
                            class: 'form-group col-md-5'
                        })
                    )
                    .append(
                        $('<div />', {
                            text: item.text,
                            class: 'form-group col-md-12 w-100'
                        })
                    ));

                if ($.parseJSON(item.approved)) {
                    $commentArea.append(
                        $('<div />', {
                            class: 'col-md-7'
                        }));
                } else {
                    $commentArea.append(
                            $('<button />', {
                                class: 'btn btn-outline-success col-md-5 prove',
                                type: 'button',
                                'data-id': item.id,
                                text: 'Prove'
                            }))
                        .append(
                            $('<div />', {
                                class: 'col-md-2'
                            })
                        );
                }
                $commentArea
                    .append(
                        $('<button />', {
                            class: 'btn btn-outline-danger col-md-5 vanish',
                            type: 'button',
                            'data-id': item.id,
                            text: 'Vanish'
                        })
                    );

            });
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
     * Changes comment
     * @param {string} user - user name
     * @param {string} text - review text
     * @param {string} id - comment ID 
     */
    change(user, text, id) {
        const comment = {
            id: id,
            user: user,
            text: text,
            approved: false
        };

        if (id !== "") {
            // check if a comment with that ID appears - change comment, else add new
            const foundCommentURL = this.url + id;
            $.get(foundCommentURL, {}, (comments) => {
                $.ajax({
                    type: 'PATCH',
                    url: foundCommentURL,
                    data: comment,
                    success: () => this.render(),
                    error: () => this.showMessage(this.errorSelector, 'Sorry. An error occurred while changing the comment. Try later.', 'Error!'),
                });
            }, 'json').fail(() => {
                $.ajax({
                    type: 'POST',
                    url: this.url,
                    data: comment,
                    success: () => this.render(),
                    error: () => this.showMessage(this.errorSelector, 'Sorry. An error occurred while adding the comment. Try later.', 'Error!'),
                })
            });
        } else {
            this.add(user, text);
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
                approved: true
            },
            success: () => this.render(),
            error: () => this.showMessage(this.errorSelector, 'Sorry. An error occurred while submitting the comment. Try later.', 'Error!'),
        });
    }

    /**
     * Removes comment
     * @param {string} id - comment ID
     */
    delete(id) {
        $.ajax({
            type: 'DELETE',
            url: this.url + id,
            success: () => this.render(),
            error: () => this.showMessage(this.errorSelector, 'Sorry. An error occurred while deleting the comment. Try later.', 'Error!'),
        });
    }

    /**
     * Shows message dialog
     * @param {string} id - selector name
     * @param {string} message - message text
     * @param {string} caption - dialog caption
     */
    showMessage(id, message, caption) {
        $(id).dialog({
                title: caption
            })
            .text(message);
    }
}
