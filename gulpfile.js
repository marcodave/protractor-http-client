var gulp = require("gulp");
var ts = require("gulp-typescript");
var gulpSequence = require('gulp-sequence');
var tsProject = ts.createProject("./tsconfig.json");
var spawn = require('child_process').spawn;
var nodemon = require('gulp-nodemon');
var del = require("del");

gulp.task("clean", function () {
    del(['dist']);
    var filter = function (extension) {
        return function (file) {
            return file.replace(/.ts$/, '.' + extension);
        };
    };
    return gulp.src("src/**/*.ts", function (err, files) {
        del(files.map(filter("js")));
        del(files.map(filter("js.map")));
    })
});


gulp.task('test', ['start-server'], function () {
    var cmd = spawn('npm', ['test'], {stdio: 'inherit'});
    return cmd.on('exit', function (code) {
        process.exit(code);
    });
});

gulp.task("build", function () {
    var tsResult = tsProject.src() // or tsProject.src()
        .pipe(tsProject());

    return tsResult.on('error', function () {
        process.exit(1)
    })
        .js.pipe(gulp.dest("dist"))

});

gulp.task("init-db", function () {
    var cmd = spawn('node', ["server/initDB.js"], {stdio: 'inherit'});
    return cmd.on('exit', function (code) {
       console.log("Database initialised");
    });
});

gulp.task("auth-server", function () {
    return nodemon({
        script: "server/auth-server.js",
        ignore: ["/*.*","/**/*.*"]
    }).on("error",function (err) {
        console.log(err);
    })
});

gulp.task("start-server", gulpSequence('init-db','auth-server'));

gulp.task('default', gulpSequence('clean', 'build', 'test'));