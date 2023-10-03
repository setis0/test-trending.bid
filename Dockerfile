FROM ubuntu:latest
LABEL authors="alex"

ENTRYPOINT ["top", "-b"]
EXPOSE 8080
