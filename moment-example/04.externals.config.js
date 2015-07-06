/**
 * Created by yan on 15-7-6.
 */
module.exports = {
    entry: "./entry.js",
    output: {
        path: "dist",
        filename: "bundle.js"
    },
    profile: true,
    stats: {
        reasons: true,
        exclude: [],
        modules: true,
        colors: true,
    },
    externals: {
        moment: "var moment"
    }
}