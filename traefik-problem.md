services:
  ph1l74-traefik:
    image: traefik:v2.10
    container_name: ph1l74-traefik
    command:
      - --api.insecure=true  
      - --api.dashboard=true
      - --log.level=DEBUG
      - --providers.docker=true
      - --providers.docker.exposedbydefault=false
      - --providers.docker.network=ph1l74-network
      - --entrypoints.web.address=:80
      - --entrypoints.websecure.address=:443
      - --certificatesresolvers.letsencrypt.acme.email=ph1l74rus@gmail.com
      - --certificatesresolvers.letsencrypt.acme.storage=/letsencrypt/acme.json
      - --certificatesresolvers.letsencrypt.acme.httpchallenge.entrypoint=web
      - --serversTransport.insecureSkipVerify=true
      - --entrypoints.websecure.http.tls.options=default
      - --entrypoints.websecure.http.tls.certResolver=letsencrypt
      - --entrypoints.websecure.http.tls.domains[0].main=ph1l74.com
      - --entrypoints.websecure.http.tls.domains[0].sans=*.ph1l74.com
    ports:
      - "80:80"
      - "443:443"
      - "8080:8080"  # Порт для dashboard
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - ./letsencrypt:/letsencrypt
    labels:
      - "traefik.enable=true"

      # Add IP allowlist for sensitive endpoints (optional):
      - "traefik.http.middlewares.ph1l74-ipwhitelist.ipwhitelist.sourcerange=91.184.247.52/32"
      - "traefik.http.routers.dashboard.rule=Host(`traefik.ph1l74.com`) && (PathPrefix(`/api`) || PathPrefix(`/dashboard`))"
      - "traefik.http.routers.dashboard.service=api@internal"
      - "traefik.http.routers.dashboard.tls=true"
      - "traefik.http.routers.dashboard.tls.certresolver=letsencrypt"
      - "traefik.http.routers.dashboard.middlewares=auth"
      - "traefik.http.middlewares.auth.basicauth.users=${TRAEFIK_BASIC_AUTH}"
    networks:
      - ph1l74-network
    restart: unless-stopped


networks:
  ph1l74-network:
    external: true
    