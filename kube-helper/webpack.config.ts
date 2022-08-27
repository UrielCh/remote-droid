import * as path from "path";

module.exports = {
  entry: "./index.ts",
  target: "node",
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  // mode: "development",
  optimization: {
    // chunkIds: "named",
    // minimize: false,
    // usedExports: true,
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname),
  },
};
