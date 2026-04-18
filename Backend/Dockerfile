# ---------- Build stage ----------
FROM eclipse-temurin:21-jdk AS builder
WORKDIR /app
COPY . .
RUN chmod +x gradlew
RUN ./gradlew build -x test

# ---------- Run stage ----------
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=builder /app/build/libs/*.jar app.jar
EXPOSE 8080
ENV JVM_XMS=192m
ENV JVM_XMX=384m
ENTRYPOINT ["sh", "-c", "java -Xms${JVM_XMS} -Xmx${JVM_XMX} -XX:+ExitOnOutOfMemoryError -jar app.jar"]