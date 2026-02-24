import { ethers } from "ethers";
import DocTimestampArtifact from "./DocTimestamp.json";

export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "";

export const CONTRACT_ABI = DocTimestampArtifact.abi;

export async function getContract(runner: ethers.ContractRunner) {
    if (!CONTRACT_ADDRESS) throw new Error("Contract address not set");
    return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, runner);
}

export function getProvider() {
    if (typeof window !== "undefined" && window.ethereum) {
        return new ethers.BrowserProvider(window.ethereum);
    }
    return null;
}
