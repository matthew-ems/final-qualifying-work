FROM mcr.microsoft.com/dotnet/aspnet:6.0 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

FROM mcr.microsoft.com/dotnet/sdk:6.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src
COPY ["freelance-network-backend/freelance-network-backend.csproj", "freelance-network-backend/"]
RUN dotnet restore "freelance-network-backend/freelance-network-backend.csproj"
COPY . .
WORKDIR "/src/freelance-network-backend"
RUN dotnet build "freelance-network-backend.csproj" -c $BUILD_CONFIGURATION -o /app/build

FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "freelance-network-backend.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "freelance-network-backend.dll"]
