# MentraOS Glasses Simulator - TEE Deployment

This repository contains the MentraOS smart glasses simulator configured for deployment to Secret Network's SecretVM TEE infrastructure.

## What This Does

- **Visual Simulator**: React-based GUI showing the glasses display
- **WebSocket Server**: Port 3001 for app connections
- **TEE Attestation**: Runs in Intel TDX trusted execution environment
- **Public Access**: GUI accessible for demos and testing

## Architecture

```
┌─────────────────────────────────────┐
│   SecretVM (Intel TDX TEE)          │
│                                     │
│  ┌──────────────────────────────┐  │
│  │  Simulator Container         │  │
│  │  - React Frontend (GUI)      │  │
│  │  - WebSocket Server :3001    │  │
│  └──────────────────────────────┘  │
│           ▲                         │
│           │ WebSocket               │
│           │                         │
│  ┌──────────────────────────────┐  │
│  │  Display App Container       │  │
│  │  (mentra-display-secretvm)   │  │
│  └──────────────────────────────┘  │
└─────────────────────────────────────┘
```

## Local Development

```bash
npm install
npm run dev
```

## Docker Build

```bash
docker build -t mentraos-simulator-tee .
docker run -p 3001:3001 mentraos-simulator-tee
```

## SecretVM Deployment

1. Push changes to `main` branch
2. GitHub Actions automatically builds and pushes to GHCR
3. Deploy to SecretVM using `docker-compose.yaml`
4. Access GUI at SecretVM public IP on port 3001

## Environment Variables

- `NODE_ENV`: Production/development mode (default: production)
- `PORT`: WebSocket server port (default: 3001)
- `HOST`: Bind address (default: 0.0.0.0)

## TEE Attestation

SecretVM automatically generates attestation proofs showing the simulator runs in genuine Intel TDX hardware:
- Automata blockchain transaction hash
- zkVerify blockchain verification

## License

Part of the MentraOS ecosystem - see original repository for license details.
