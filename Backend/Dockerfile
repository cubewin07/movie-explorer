# ---------- Build stage ----------
FROM eclipse-temurin:21-jdk AS builder
WORKDIR /app
COPY . .
RUN chmod +x gradlew
RUN ./gradlew clean bootJar -x test

# ---------- Run stage ----------
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=builder /app/build/libs/*.jar /app/
RUN set -eux; \
	boot_jar=$(ls /app/*.jar | grep -v -- '-plain\.jar$' | head -n 1); \
	[ -n "$boot_jar" ]; \
	mv "$boot_jar" /app/app.jar; \
	rm -f /app/*-plain.jar
EXPOSE 8080
ENV JVM_XMS=192m
ENV JVM_XMX=384m
ENTRYPOINT ["sh", "-c", "java -Xms${JVM_XMS} -Xmx${JVM_XMX} -XX:+ExitOnOutOfMemoryError -jar app.jar"]