# Stage 1: Build the JAR using Maven and JDK 17 from repository root
FROM maven:3.9.9-eclipse-temurin-17 AS build
WORKDIR /app

# Copy pom.xml from BACKEND_PETCARE and cache dependencies
COPY BACKEND_PETCARE/pom.xml .
RUN mvn dependency:go-offline -B

# Copy backend source code and build production jar
COPY BACKEND_PETCARE/src ./src
RUN mvn clean package -DskipTests

# Stage 2: Minimal runtime image
FROM eclipse-temurin:17-jre
WORKDIR /app

COPY --from=build /app/target/*.jar app.jar

# Expose port (Render automatically sets $PORT)
EXPOSE 8080
ENV PORT=8080

ENTRYPOINT ["java", "-Xms180m", "-Xmx320m", "-XX:+UseSerialGC", "-XX:TieredStopAtLevel=1", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]
