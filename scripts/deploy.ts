import { ethers } from "hardhat";
import fs from "fs";
import path from "path";

async function main() {
  const docTimestamp = await ethers.deployContract("DocTimestamp");

  await docTimestamp.waitForDeployment();

  const address = await docTimestamp.getAddress();
  console.log(`DocTimestamp deployed to ${address}`);

  // Update frontend config
  const frontendDir = path.join(__dirname, "../web");

  // 1. Update .env.local
  const envFilePath = path.join(frontendDir, ".env.local");
  const envContent = `NEXT_PUBLIC_CONTRACT_ADDRESS=${address}\n`;
  fs.writeFileSync(envFilePath, envContent);
  console.log(`Updated ${envFilePath}`);

  // 2. Copy ABI
  const artifactPath = path.join(__dirname, "../artifacts/contracts/DocTimestamp.sol/DocTimestamp.json");
  const frontendLibDir = path.join(frontendDir, "src/lib");

  if (!fs.existsSync(frontendLibDir)) {
    fs.mkdirSync(frontendLibDir, { recursive: true });
  }

  const destinationPath = path.join(frontendLibDir, "DocTimestamp.json");
  fs.copyFileSync(artifactPath, destinationPath);
  console.log(`Copied ABI to ${destinationPath}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
