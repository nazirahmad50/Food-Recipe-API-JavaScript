const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
module.exports = {
    entry: ["babel-polyfill","./src/js/index.js"], //entry point
    output:{
        path:path.resolve(__dirname, "dist"), // join the current absolute path with the one which we want our bundle in which is dist
        filename: "js/bundle.js"
    },
    devServer:{
        contentBase: "./dist"
    },
    plugins:[
        new HtmlWebpackPlugin({
            filename: "index.html",
            template: "./src/index.html"
        })
    ],
    module:{
        rules:[
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use:{
                    loader: "babel-loader"
                }
            }
        ]
    }

}