@REM Maven Wrapper startup batch script for Windows
@REM Required: Java 17+
@setlocal

@set "WRAPPER_JAR=%~dp0.mvn\wrapper\maven-wrapper.jar"
@set "WRAPPER_LAUNCHER=org.apache.maven.wrapper.MavenWrapperMain"
@set "MVNW_BASEDIR=%~dp0."

@set "MAVEN_CMD=java"
@if not "%JAVA_HOME%"=="" set "MAVEN_CMD=%JAVA_HOME%\bin\java"

"%MAVEN_CMD%" "-Dmaven.multiModuleProjectDirectory=%MVNW_BASEDIR%" -cp "%WRAPPER_JAR%" %WRAPPER_LAUNCHER% %*
