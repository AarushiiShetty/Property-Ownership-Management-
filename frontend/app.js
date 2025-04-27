let landContract;
let propertyContract;
let accounts;

async function connectWallet() {
  if (typeof window.ethereum !== 'undefined') {
    try {
      const acc = await window.ethereum.request({ method: 'eth_requestAccounts' });
      accounts = acc;
      document.getElementById('output').innerText = `✅ Connected: ${accounts[0]}`;
    } catch (err) {
      document.getElementById('output').innerText = `❌ Error: ${err.message}`;
    }
  } else {
    alert('🦊 Please install MetaMask!');
  }
}

async function registerLand() {
  try {
    const location = document.getElementById('regLocation').value;
    const area = document.getElementById('regArea').value;

    if (!location || !area) {
      document.getElementById('output').innerText = "⚠️ Please fill in all fields.";
      return;
    }

    await landContract.methods.registerLand(location, area).send({ from: accounts[0] });
    document.getElementById('output').innerText = "📌 Land successfully registered!";
  } catch (err) {
    document.getElementById('output').innerText = `❌ Error: ${err.message}`;
  }
}

async function transferLand() {
  try {
    const landId = document.getElementById('transferId').value;
    const newOwner = document.getElementById('newOwner').value;

    if (!landId || !newOwner) {
      document.getElementById('output').innerText = "⚠️ Please provide both Land ID and New Owner address.";
      return;
    }

    await landContract.methods.transferLand(landId, newOwner).send({ from: accounts[0] });
    document.getElementById('output').innerText = `📦 Land transferred to ${newOwner}!`;
    loadLandDetails(landId);
  } catch (err) {
    document.getElementById('output').innerText = `❌ Error: ${err.message}`;
  }
}

async function loadLandDetails(landId) {
  try {
    if (!landContract) {
      document.getElementById('output').innerText = "❌ Contract not loaded.";
      return;
    }

    const land = await landContract.methods.getLandDetails(landId).call();
    const landDetails = `
      <p><strong>Land ID:</strong> ${land.id}</p>
      <p><strong>Location:</strong> ${land.location}</p>
      <p><strong>Area:</strong> ${land.area} sq ft</p>
      <p><strong>Owner:</strong> ${land.owner}</p>
      <p><strong>Transferred:</strong> ${land.transferred ? "Yes" : "No"}</p>
    `;
    document.getElementById('landDetails').innerHTML = landDetails;
    document.getElementById('output').innerText = "";
  } catch (err) {
    document.getElementById('output').innerText = `❌ Error fetching land details: ${err.message}`;
  }
}

window.addEventListener('load', async () => {
  try {
    const landRes = await fetch('./build/contracts/LandRegistry.json');
    const propertyRes = await fetch('./build/contracts/PropertyRegistry.json');

    const landData = await landRes.json();
    const propertyData = await propertyRes.json();

    const web3 = new Web3(Web3.givenProvider || "http://localhost:8545");

    const networkId = await web3.eth.net.getId();

    const landNetwork = landData.networks[networkId];
    const propertyNetwork = propertyData.networks[networkId];

    if (!landNetwork || !propertyNetwork) {
      document.getElementById('output').innerText = "❗ Contracts not deployed on the connected network.";
      return;
    }

    landContract = new web3.eth.Contract(landData.abi, landNetwork.address);
    propertyContract = new web3.eth.Contract(propertyData.abi, propertyNetwork.address);

    console.log("✅ Contracts loaded:", { land: landNetwork.address, property: propertyNetwork.address });
  } catch (error) {
    document.getElementById('output').innerText = `❌ Error loading contracts: ${error.message}`;
    console.error("Contract load failed:", error);
  }
});
