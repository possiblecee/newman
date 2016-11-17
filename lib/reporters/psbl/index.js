var fs = require('fs'),
    _ = require('lodash'),
    path = require('path'),
    fileSize = require('filesize'),
    prettyMs = require('pretty-ms'),
    handlebars = require('handlebars'),

    /**
     * An object of the default file read preferences.
     *
     * @type {Object}
     */
    FILE_READ_OPTIONS = { encoding: 'utf8' },

    /**
     * The default Handlebars template to use when no user specified template is provided.
     *
     * @type {String}
     */
    DEFAULT_TEMPLATE = 'template-default.hbs',

    /**
     * A reference object for run stats properties to use for various assertion states.
     *
     * @type {Object}
     */
    ASSERTION_STATE = { false: 'passed', true: 'failed' },

    PostmanHTMLReporter;

/**
 * A function that creates raw markup to be written to Newman HTML reports.
 *
 * @param {Object} newman - The collection run object, with a event handler setter, used to enable event wise reporting.
 * @param {Object} options - The set of HTML reporter run options.
 * @param {String=} options.template - Optional path to the custom user defined HTML report template (Handlebars).
 * @param {String=} options.export - Optional custom path to create the HTML report at.
 * @returns {*}
 */
PostmanHTMLReporter = function (newman, options) {
    // @todo throw error here or simply don't catch them and it will show up as warning on newman
    var htmlTemplate = options.template || path.join(__dirname, DEFAULT_TEMPLATE),
        compiler = handlebars.compile(fs.readFileSync(htmlTemplate, FILE_READ_OPTIONS));

    newman.on('beforeDone', function () {
        var executions = _.get(this, 'summary.run.executions').map((execution) => ({
            name: execution.item.name,
            url: execution.request.url.getRaw(),
            method: execution.request.method,
            responseCode: execution.response.code,
            style: {
                status: execution.response.code < 400 ? 'success' : 'danger',
            }
        }));

        this.exports.push({
            name: 'psbl-reporter',
            default: 'newman-run-report.html',
            path: options.export,
            content: compiler({
                timestamp: Date(),
                executions: executions,
            })
        });
    });
};

module.exports = PostmanHTMLReporter;
