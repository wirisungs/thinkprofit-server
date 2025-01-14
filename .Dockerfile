# Sử dụng Node.js base image
FROM node:16

# Tạo thư mục ứng dụng
WORKDIR /usr/src/app

# Sao chép tệp package.json và cài đặt dependencies
COPY package*.json ./
RUN npm install

# Sao chép toàn bộ mã nguồn
COPY . .

# Mở cổng và chạy ứng dụng
EXPOSE 3000
CMD ["npm", "start"]
