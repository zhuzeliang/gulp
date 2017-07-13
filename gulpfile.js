var gulp = require('gulp'),
    less = require('gulp-less'),
    sass = require('gulp-sass'),
    connect = require('gulp-connect'),
    livereload = require('gulp-livereload'),
    sourcemaps = require('gulp-sourcemaps'),
    htmlmin = require('gulp-htmlmin'),
    minifycss = require('gulp-minify-css'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    jshint = require('gulp-jshint'),
    notify = require('gulp-notify'),
    imagemin = require('gulp-imagemin'),
    pngquant = require('imagemin-pngquant'),
    runSequence = require('run-sequence'),
    rev = require('gulp-rev'),
    cache = require('gulp-cache'),
    autoprefixer = require('gulp-autoprefixer'),
    clean = require('gulp-clean'),
    revCollector = require('gulp-rev-collector'),
    spritesmith = require('gulp.spritesmith');

//合并雪碧图
gulp.task('sprite', function() {
    var spriteData = gulp.src('src/images/sprite_*.png').pipe(spritesmith({
        imgName: 'images/sprite.png',
        cssName: 'sass/_sprite.scss',
        cssFormat: 'scss'
    }));
    return spriteData.pipe(gulp.dest('src/'));
});
// less编译
gulp.task('less', function() {
    gulp.src('src/less/*.less')
        .pipe(sourcemaps.init())
        .pipe(less())
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('src/css/'));
});


// sass编译
gulp.task('sass', function() {
    gulp.src('src/sass/*.scss')
        .pipe(sourcemaps.init())
        .pipe(sass())
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('src/css/'));
});



//自动生成版本号,避免缓存
gulp.task('revImg', function(){
    return gulp.src('src/images/*')
        .pipe(rev())
        .pipe(rev.manifest())
        .pipe(gulp.dest('src/rev/img'));
});
gulp.task('revCss', function() {
    return gulp.src('src/css/*.css')
        .pipe(rev())
        .pipe(rev.manifest())
        .pipe(gulp.dest('src/rev/css'));
});

gulp.task('revJs', function() {
    return gulp.src('src/js/*.js')
        .pipe(rev())
        .pipe(rev.manifest())
        .pipe(gulp.dest('src/rev/js'));
});

//Html替换img、css、js文件版本
gulp.task('revHtml', function() {
    return gulp.src(['src/rev/**/*.json', 'src/html/*.html'])
        .pipe(revCollector())
        .pipe(gulp.dest('src/html'));
});
//scss替换img文件版本
gulp.task('revScss', function() {
    return gulp.src(['src/rev/**/*.json', 'src/sass/*.scss'])
        .pipe(revCollector())
        .pipe(gulp.dest('src/sass'));
});

//开发构建
gulp.task('dev', function(done) {
    condition = false;
    runSequence(
        ['revImg'],['revCss'],['revScss'], ['revJs'], ['revHtml'],
        done);
});


//css合并处理
// gulp.task('minifycss',function(){
//    return gulp.src('css/*.css')      //设置css
//        .pipe(concat('order_query.css'))      //合并css文件到"order_query"
//        .pipe(gulp.dest('styles'))           //设置输出路径
//        .pipe(rename({suffix:'.min'}))         //修改文件名
//        .pipe(minifycss())                    //压缩文件
//        .pipe(gulp.dest('styles'))            //输出文件目录
//        .pipe(notify({message:'css task ok'}));   //提示成功
// });

// //JS合并处理
// gulp.task('minifyjs',function(){
//    return gulp.src('js/*.js')  //选择合并的JS
//        .pipe(concat('order_query.js'))   //合并js
//        .pipe(gulp.dest('dist/js'))         //输出
//        .pipe(rename({suffix:'.min'}))     //重命名
//        .pipe(uglify())                    //压缩
//        .pipe(gulp.dest('dist/js'))            //输出 
//        .pipe(notify({message:"js task ok"}));    //提示
// });



//压缩html
gulp.task('html', function() {
    var options = {
        removeComments: true, //清除HTML注释
        collapseWhitespace: true, //压缩HTML
        collapseBooleanAttributes: true, //省略布尔属性的值 <input checked="true"/> ==> <input checked />
        removeEmptyAttributes: true, //删除所有空格作属性值 <input id="" /> ==> <input />
        removeScriptTypeAttributes: true, //删除<script>的type="text/javascript"
        removeStyleLinkTypeAttributes: true, //删除<style>和<link>的type="text/css"
        minifyJS: true, //压缩页面JS
        minifyCSS: true //压缩页面CSS
    };
    gulp.src('src/html/*.html')
        .pipe(htmlmin(options))
        .pipe(gulp.dest('dist/html'));
});




// JS hint 检查
// gulp.task('jshint', function() {
//     gulp.src('src/js/*.js')
//       .pipe(jshint())
//       .pipe(jshint.reporter('default'));
// });

//压缩js
gulp.task('uglifyjs', function() {
    gulp.src('src/js/*.js')
        .pipe(uglify())
        .pipe(gulp.dest('dist/js'))
});

//压缩css
gulp.task('minifycss', function() {
    gulp.src('src/css/*.css')
        .pipe(minifycss())
        .pipe(gulp.dest('dist/css'))
});

//压缩images
gulp.task('imagemin', function() {
    gulp.src('src/images/*.{png,jpg,gif,ico}')
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [{ removeViewBox: false }], //不要移除svg的viewbox属性
            use: [pngquant()] //使用pngquant深度压缩png图片的imagemin插件
        }))
        .pipe(gulp.dest('dist/images'));
});

//创建本地服务器
gulp.task('webserver', function() {
    connect.server({
        livereload: true
    });
});

//清空项目输出目录
gulp.task('clean', function() {
    return gulp.src(['dist/js/', 'dist/css/', 'dist/html/', 'dist/images/'], { read: false })
        .pipe(clean());
});


//监控文件变化
gulp.task('watch', function() {

    gulp.watch('src/less/*.less', ['less']);
    gulp.watch('src/sass/*.scss', ['sass']);
    gulp.watch('src/html/*.html', ['html']);
    gulp.watch('src/js/*.js', ['uglifyjs']);
    gulp.watch('src/css/*.css', ['minifycss']);
    gulp.watch('src/images/*.*', ['imagemin']);
    gulp.watch('src/images/icon_*.png', ['sprite']);

});


// 将你的默认的任务代码放在这
gulp.task('default', ['clean'], function() {
    gulp.start('less', 'sass', 'uglifyjs', 'minifycss', 'html', 'imagemin', 'dev', 'watch', 'webserver', "sprite");
    // gulp.start('less', 'sass', 'uglifyjs', 'minifycss', 'html', 'imagemin', 'dev', 'watch', 'webserver');
});
