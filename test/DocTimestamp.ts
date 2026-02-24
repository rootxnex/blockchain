import {
    loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("DocTimestamp", function () {
    async function deployDocTimestampFixture() {
        const [owner, otherAccount] = await ethers.getSigners();
        const docTimestamp = await ethers.deployContract("DocTimestamp");
        return { docTimestamp, owner, otherAccount };
    }

    describe("Register", function () {
        it("Should register a new document", async function () {
            const { docTimestamp, owner } = await loadFixture(deployDocTimestampFixture);
            const hash = ethers.id("test document");

            await expect(docTimestamp.register(hash))
                .to.emit(docTimestamp, "Registered")
                .withArgs(hash, owner.address, (await ethers.provider.getBlock("latest"))?.timestamp! + 1); // approximate checking, block timestamp might change slightly? No, evm mine is exact in hardhat usually. Let's rely on event emission content or just verify state
        });

        it("Should revert if already registered", async function () {
            const { docTimestamp } = await loadFixture(deployDocTimestampFixture);
            const hash = ethers.id("test document");

            await docTimestamp.register(hash);
            await expect(docTimestamp.register(hash)).to.be.revertedWith("Already registered");
        });

        it("Should revert if hash is zero", async function () {
            const { docTimestamp } = await loadFixture(deployDocTimestampFixture);
            const zeroHash = ethers.ZeroHash;
            await expect(docTimestamp.register(zeroHash)).to.be.revertedWith("Invalid docHash");
        });
    });

    describe("Verify", function () {
        it("Should return correct proof for registered document", async function () {
            const { docTimestamp, owner } = await loadFixture(deployDocTimestampFixture);
            const hash = ethers.id("test document");

            await docTimestamp.register(hash);
            const [exists, proofOwner, timestamp] = await docTimestamp.verify(hash);

            expect(exists).to.equal(true);
            expect(proofOwner).to.equal(owner.address);
            expect(timestamp).to.be.gt(0);
        });

        it("Should return false for unregistered document", async function () {
            const { docTimestamp } = await loadFixture(deployDocTimestampFixture);
            const hash = ethers.id("unregistered document");

            const [exists, proofOwner, timestamp] = await docTimestamp.verify(hash);

            expect(exists).to.equal(false);
            expect(proofOwner).to.equal(ethers.ZeroAddress);
            expect(timestamp).to.equal(0);
        });
    });
});
