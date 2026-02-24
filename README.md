# On-Chain Document Timestamp

A decentralized application (dApp) that allows users to timestamp documents on the Ethereum blockchain (Sepolia Testnet).

## Features
- **Client-Side Hashing**: Files are hashed in the browser using the Web Crypto API. The file itself never leaves your device.
- **Immutable Proof**: The SHA-256 hash is registered on-chain with the owner's address and timestamp.
- **Verification**: Anyone can verify a document's existence and registration details by re-uploading the file or providing its hash.

## Prerequisites
- Node.js (v18 or later)
- MetaMask browser extension

## Setup

1. **Clone & Install**
   ```bash
   git clone <repo-url>
   cd onchain-doc-proof
   npm install
   cd web
   npm install
   cd ..
   ```

2. **Configure Environment**
   - Copy `.env.example` to `.env` in the root directory.
   - Fill in your `RPC_URL` (e.g., from Infura or Alchemy) and `PRIVATE_KEY` (account to deploy contract).
   ```bash
   cp .env.example .env
   ```

3. **Deploy Smart Contract**
   ```bash
   npx hardhat run scripts/deploy.ts --network sepolia
   ```
   *Copy the deployed contract address from the output.*

4. **Configure Frontend**
   - Copy `web/.env.local.example` to `web/.env.local`.
   - Paste the contract address.
   ```bash
   cd web
   cp .env.local.example .env.local
   # Edit .env.local and set NEXT_PUBLIC_CONTRACT_ADDRESS
   ```

5. **Run the App**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000).

## 60-Second Demo Script

1. **Open App**: Show the "Connect MetaMask" button. Click it and connect your wallet (Sepolia network).
2. **Upload**: Select a file (e.g., an image or PDF). Show the computed SHA-256 hash appearing instantly.
3. **Register**: Click "Register On-Chain". Confirm the transaction in MetaMask.
4. **Wait**: While waiting, explain that only the hash is sent to the chain, preserving privacy.
5. **Success**: Point out the transaction hash link (or toaster notification).
6. **Verify**: Refresh the page or go to the "Verify" section.
   - Upload the **same file** again.
   - Click "Verify".
   - Show the "✅ Document Found" method with your address and timestamp.
   - (Optional) Modify the file slightly, upload, and show it returns "❌ Not Found".

## Security & Privacy
- **Privacy**: We only store the `bytes32` SHA-256 hash. The original file contents are NOT stored on-chain or sent to any server.
- **Collisions**: We assume SHA-256 creates unique hashes for distinct documents.
- **Identity**: The "owner" is simply the wallet that sent the transaction. It proves *possession* of the file at that time, but not necessarily authorship.
