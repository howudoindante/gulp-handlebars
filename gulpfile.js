const { src, series, dest, parallel } = require('gulp');

const scss = require("gulp-sass")(require('sass'));
const rename = require("gulp-rename");
const path = require("path");
const del = require("del");
const source_folder = "/src/",
    destination_folder = "/build/";
const tap = require('gulp-tap');
const browsersync = require('browser-sync').create();
const gulp_watch = require('gulp-watch');
const include = require('gulp-include');

const handlebars = require('handlebars');
const gulpHandlebars = require('gulp-handlebars-html')(handlebars);

const routes = {
    source: {
        hbspages: path.join(__dirname, source_folder, "pages/") + "*.hbs",
        hbscomp: path.join(__dirname, source_folder, "components/**/") + "*.hbs",
        scss: path.join(__dirname, source_folder) + "styles/**/*.scss",
        js: [path.join(__dirname, source_folder) + "scripts/**/*.js", "!" + path.join(__dirname, source_folder) + "scripts/**/_*.js"],
    },
    build: {
        directory: path.join(__dirname, destination_folder),
        html: path.join(__dirname, destination_folder),
        css: path.join(__dirname, destination_folder) + "css/",
        js: path.join(__dirname, destination_folder) + "js/",
    },
    watch: {
        hbspages: path.join(__dirname, source_folder, "pages/") + "*.hbs",
        hbscomp: path.join(__dirname, source_folder, "components/**/") + "*.hbs",
        scss: path.join(__dirname, source_folder) + "styles/**/*.scss",
        scssComp: path.join(__dirname, source_folder) + "components/**/*.scss",
        js: path.join(__dirname, source_folder) + "scripts/**/*.js",
    }
}
function BSYNC() {
    browsersync.init({
        server: {
            baseDir: routes.build.directory
        },
        port: 3000
    })
}

function HBS() {
    var templateData = {
        firstName: 'Your variables goes here'
    },
        options = {
            partialsDirectory: ["./src/components/"]
        }

    return src(routes.source.hbspages)
        .pipe(gulpHandlebars(templateData, options))
        .pipe(rename(
            {
                extname: ".html"
            }
        ))
        .pipe(dest(routes.build.html))
        .pipe(browsersync.stream());
}

function SCSS() {
    return src(routes.source.scss)
        .pipe(scss().on('error', scss.logError))
        .pipe(rename(function (path) {
            path.basename = path.dirname;
        }))
        .pipe(dest(routes.build.css))
        .pipe(browsersync.stream())
}


function WATCH() {
    gulp_watch([routes.watch.scss, routes.watch.scssComp], SCSS);
    gulp_watch([routes.watch.js], JS);
    gulp_watch([routes.watch.hbspages, routes.watch.hbscomp], HBS);
}

function JS() {
    return src(routes.source.js)
        .pipe(rename(function (path) {
            path.basename = path.dirname;
        }))
        .pipe(include())
        .on('error', console.log)
        .pipe(dest(routes.build.js))
        .pipe(browsersync.stream())
}

async function CLEAN() {
    await del.sync([routes.build.directory]);
}

const BUILD = series(CLEAN, SCSS, JS, HBS)
const TASKS = parallel(BUILD, WATCH, BSYNC)


exports.HBS = HBS;
exports.SCSS = SCSS;
exports.JS = JS;
exports.BUILD = BUILD;
exports.CLEAN = CLEAN;
exports.TASKS = TASKS;
exports.default = TASKS;