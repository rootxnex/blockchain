"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { computeFileHash } from "@/lib/hash";
import { getContract, getProvider } from "@/lib/contract";

export default function Home() {
  const [wallet, setWallet] = useState<string | null>(null);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [hash, setHash] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [verifyHash, setVerifyHash] = useState<string>("");
  const [verifyResult, setVerifyResult] = useState<{
    exists: boolean;
    owner: string;
    timestamp: number;
  } | null>(null);

  useEffect(() => {
    const initProvider = async () => {
      const prov = getProvider();
      if (prov) {
        setProvider(prov);
        const accounts = await prov.listAccounts();
        if (accounts.length > 0) {
          setWallet(accounts[0].address);
        }
      }
    };
    initProvider();
  }, []);

  const connectWallet = async () => {
    if (!provider) return alert("Please install MetaMask");
    try {
      const signer = await provider.getSigner();
      setWallet(await signer.getAddress());

      const network = await provider.getNetwork();
      if (network.chainId !== 11155111n) {
        alert("Please switch to Sepolia network");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setLoading(true);
      try {
        const computedHash = await computeFileHash(selectedFile);
        setHash(computedHash);
      } catch (err) {
        console.error(err);
        alert("Error computing hash");
      } finally {
        setLoading(false);
      }
    }
  };

  const registerDocument = async () => {
    if (!hash || !wallet || !provider) return;
    setLoading(true);
    setMessage("Registering...");
    try {
      const signer = await provider.getSigner();
      const contract = await getContract(signer);
      const tx = await contract.register(hash);
      await tx.wait();
      setMessage(`Success! Tx: ${tx.hash}`);
    } catch (error: unknown) {
      const err = error as Error;
      console.error(error);
      setMessage(`Error: ${err.message || error}`);
    } finally {
      setLoading(false);
    }
  };

  const verifyDocument = async () => {
    if (!verifyHash && !hash) return;
    const hashToVerify = verifyHash || hash;
    if (!hashToVerify || !provider) return;

    setLoading(true);
    setVerifyResult(null);
    try {
      const contract = await getContract(provider);
      const [exists, owner, timestamp] = await contract.verify(hashToVerify);
      setVerifyResult({ exists, owner, timestamp: Number(timestamp) });
    } catch (error: unknown) {
      const err = error as Error;
      console.error(error);
      alert(`Verification failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      style={{
        padding: "2rem",
        fontFamily: "sans-serif",
        maxWidth: "800px",
        margin: "0 auto",
      }}
    >
      <h1>On-Chain Document Timestamp</h1>

      {!wallet ? (
        <button
          onClick={connectWallet}
          style={{ padding: "10px 20px", fontSize: "16px" }}
        >
          Connect MetaMask
        </button>
      ) : (
        <p>{"Connected: " + wallet}</p>
      )}

      <hr style={{ margin: "2rem 0" }} />

      <section>
        <h2>{"1. Upload & Register"}</h2>
        <input type="file" onChange={handleFileChange} />
        {hash && (
          <div style={{ marginTop: "1rem" }}>
            <p>
              <strong>Computed SHA-256:</strong>
            </p>
            <code
              style={{
                background: "#f4f4f4",
                padding: "5px",
                display: "block",
                wordBreak: "break-all",
              }}
            >
              {hash}
            </code>
            <br />
            <button
              onClick={registerDocument}
              disabled={loading || !wallet}
              style={{
                padding: "10px 20px",
                fontSize: "16px",
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "Processing..." : "Register On-Chain"}
            </button>
          </div>
        )}
        {message && (
          <p
            style={{
              marginTop: "1rem",
              color: message.startsWith("Error") ? "red" : "green",
            }}
          >
            {message}
          </p>
        )}
      </section>

      <hr style={{ margin: "2rem 0" }} />

      <section>
        <h2>2. Verify Document</h2>
        <div
          style={{ display: "flex", gap: "10px", marginBottom: "1rem" }}
        >
          <input
            type="text"
            placeholder="Paste SHA-256 Hash (0x...)"
            value={verifyHash}
            onChange={(e) => setVerifyHash(e.target.value)}
            style={{ flex: 1, padding: "8px" }}
          />
          <button
            onClick={verifyDocument}
            disabled={loading}
            style={{ padding: "8px 16px" }}
          >
            Verify
          </button>
        </div>
        <p style={{ fontSize: "0.9rem", color: "#666" }}>
          Or upload a file above to auto-fill its hash.
        </p>

        {verifyResult && (
          <div
            style={{
              marginTop: "1rem",
              padding: "1rem",
              border: "1px solid #ccc",
              borderRadius: "5px",
            }}
          >
            <h3>Verification Result</h3>
            {verifyResult.exists ? (
              <>
                <p>
                  {"Document Found"}
                </p>
                <p>
                  <strong>Owner:</strong> {verifyResult.owner}
                </p>
                <p>
                  <strong>Timestamp:</strong>{" "}
                  {new Date(
                    verifyResult.timestamp * 1000
                  ).toLocaleString()}
                </p>
              </>
            ) : (
              <p>{"Document NOT found on-chain."}</p>
            )}
          </div>
        )}
      </section>
    </main>
  );
}
