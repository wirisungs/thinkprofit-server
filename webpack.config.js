const path = require('path');

module.exports = {
  // Chế độ: 'development' hoặc 'production'
  mode: 'development',

  // Điểm đầu vào của ứng dụng
  entry: './src/index.js',

  // Đầu ra sau khi bundle
  output: {
    // Tên file bundle
    filename: 'bundle.js',
    // Đường dẫn tuyệt đối đến thư mục output
    path: path.resolve(__dirname, 'dist'),
  },

  // Môi trường mục tiêu
  target: 'node',

  // Cấu hình module và loader
  module: {
    rules: [
      {
        // Áp dụng Babel cho các file .js
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      },
      // Các loader khác (nếu cần) có thể được thêm vào đây
    ],
  },

  // Cấu hình các tiện ích mở rộng
  resolve: {
    extensions: ['.js'],
  },

  // Cấu hình source map để dễ dàng debug
  devtool: 'source-map',
};
