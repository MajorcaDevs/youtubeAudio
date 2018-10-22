FROM node AS builder

RUN git clone https://github.com/MajorcaDevs/youtubeAudio && \
    cd youtubeAudio && \
    npm install && \
    npm run build

FROM nginx:alpine

COPY default.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /youtubeAudio/build/ /usr/share/nginx/html/