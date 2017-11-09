'use strict';

/**
 * Сделано задание на звездочку
 * Реализованы методы several и through
 */
getEmitter.isStar = false;
module.exports = getEmitter;

var subscriptionTypes = {
    on: 1,
    through: 2,
    several: 3
};

var subscribers = [];

function processEvents(event) {
    switch (event.type) {
        case subscriptionTypes.on:
            event.handler();
            break;
        case subscriptionTypes.through:
            event.counter++;
            if (event.counter % event.parametr === 0) {
                event.handler();
            }
            break;
        case subscriptionTypes.several:
            event.counter++;
            if (event.counter <= event.parametr) {
                event.handler();
            }
            break;
        default:
            throw new TypeError('wrong event type ' + event.type + '!');
    }
}

function concat(lst) {
    var res = '';
    for (var i = 0; i < lst.length - 1; i++) {
        res += lst[i] + '.';
    }
    res += lst[lst.length - 1];

    return res;
}

function listOfRightEvens(events) {
    var res = [];
    var lst = events.split('.');
    var count = lst.length;
    for (var i = count; i > 0; i--) {
        res.push(concat(lst.slice(0, i)));
    }

    return res;
}

function proecessOneOfRightEvent(event) {
    for (var man of subscribers) {
        if (man.event === event) {
            processEvents(man);
        }
    }
}

/**
 * Возвращает новый emitter
 * @returns {Object}
 */
function getEmitter() {
    return {

        /**
         * Подписаться на событие
         * @param {String} event
         * @param {Object} context
         * @param {Function} handler
         * @returns {Object}
         */
        on: function (event, context, handler) {
            subscribers.push({
                human: context,
                event: event,
                handler: handler.bind(context),
                type: subscriptionTypes.on
            });

            return this;
        },

        /**
         * Отписаться от события
         * @param {String} event
         * @param {Object} context
         * @returns {Object}
         */
        off: function (event, context) {
            subscribers = subscribers.filter(t =>
                !(t.human === context && (t.event === event || t.event.startsWith(event + '.')))
            );

            return this;
        },

        /**
         * Уведомить о событии
         * @param {String} event
         * @returns {Object}
         */
        emit: function (event) {
            var rEvents = listOfRightEvens(event);
            for (var i = 0; i < rEvents.length; i++) {
                var ev = rEvents[i];
                proecessOneOfRightEvent(ev);
            }

            return this;
        },

        /**
         * Подписаться на событие с ограничением по количеству полученных уведомлений
         * @star
         * @param {String} event
         * @param {Object} context
         * @param {Function} handler
         * @param {Number} times – сколько раз получить уведомление
         * @returns {Object}
         */
        several: function (event, context, handler, times) {
            if (times <= 0) {
                return this.on(event, context, handler);
            }
            subscribers.push({
                human: context,
                event: event,
                handler: handler.bind(context),
                type: subscriptionTypes.several,
                parametr: times,
                counter: 0
            });

            return this;
        },

        /**
         * Подписаться на событие с ограничением по частоте получения уведомлений
         * @star
         * @param {String} event
         * @param {Object} context
         * @param {Function} handler
         * @param {Number} frequency – как часто уведомлять
         * @returns {Object}
         */
        through: function (event, context, handler, frequency) {
            if (frequency <= 0) {
                return this.on(event, context, handler);
            }
            subscribers.push({
                human: context,
                event: event,
                handler: handler.bind(context),
                type: subscriptionTypes.through,
                parametr: frequency,
                counter: 0
            });

            return this;
        }
    };
}
