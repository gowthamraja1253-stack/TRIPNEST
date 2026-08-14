# Build Stage
FROM maven:3.9.7-eclipse-temurin-21 AS build
WORKDIR /app
ENV MAVEN_OPTS="-Xmx256m"
COPY pom.xml .
# Download all dependencies first (cacheable layer)
RUN mvn dependency:resolve dependency:resolve-plugins -B
COPY src ./src
# Compile and package the application
RUN mvn package -DskipTests -B

# Run Stage
FROM eclipse-temurin:21-jdk-alpine
WORKDIR /app
COPY --from=build /app/target/tripnest-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
