function carQueryJSONP(url) {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    const callbackName = "cb_" + Math.random().toString(36).substring(2);

    window[callbackName] = function (data) {
      resolve(data);
      document.body.removeChild(script);
      delete window[callbackName];
    };

    script.src = `${url}&callback=${callbackName}`;
    script.onerror = reject;

    document.body.appendChild(script);
  });
}
async function makes() {
  try {
    const response = await fetch("https://vpic.nhtsa.dot.gov/api/vehicles/GetAllMakes?format=json");
    const data = await response.json();

    /*
    const commonMakes = ["Acura", "Alfa Romeo", "Audi", "Bentley", "BMW", "Buick", "Cadillac", "Chevrolet", "Chrysler", "Dodge",
                         "Fiat", "Ford", "GMC", "Honda", "Hyundai", "Infiniti", "Jaguar", "Jeep", "Kia", "Land Rover", "Lexus",
                         "Lincoln", "Mazda", "Mercedes-Benz", "Mini", "Mitsubishi", "Nissan", "Polestar","Porsche", "Ram", "Rivian",
                         "Saab", "Subaru", "Suzuki", "Tesla", "Toyota", "Volkswagen", "Volvo"];
    */         

  
    
    let makeOutput = `
      ${data.Results.map(function (item){
        return `<option value="${item.Make_Name}">`;
      }).join('')}`;

    document.getElementById("makes").innerHTML = makeOutput;

    /*
    document.getElementById("model").innerHTML = modelOutput;
    document.getElementById("year").innerHTML = yearOutput;
    document.getElementById("mileage").innerHTML = mileageOutput;
    document.getElementById("trim").innerHTML = trimOutput;
    */
    
} catch (e) {
  console.log("Error!")
  }
}
      
makes();

async function models(el) {
  const row = el.closest(".vehicle-row");
  const make = el.value;
  try {
    const response = await fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/GetModelsForMake/${make}?format=json`);
    const data = await response.json();

   let modelOutput = `
      ${data.Results.map(function (item){
        return `<option value="${item.Model_Name}">`;
      }).join('')}`;

    row.querySelector("#models").innerHTML = modelOutput;
    row.querySelector("#model").disabled = false;
    
    } catch (e) {
  console.log("Error!")
  }
}


async function years(el) {
  const row = el.closest(".vehicle-row");
  const make = row.querySelector("#make").value;
  const model = el.value;
  if (!make || !model) return;
  const Year = new Date().getFullYear();
  const promises = [];
  
  for (let y = Year; y >= Year - 70; y--) {
    promises.push(fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/GetModelsForMakeYear/make/${make}/modelyear/${y}?format=json`)
      .then(response => response.json())
      .then(data => {
        const exists = data.Results && data.Results.some(item => {
          const modelData = item.Model_Name.toLowerCase();
          const specificModel = model.toLowerCase();
          return modelData === specificModel || modelData.startsWith(specificModel);});
        return exists ? `<option value="${y}">` : null;})
    
.catch(() => null));}

const results = await Promise.all(promises);
const availableYears = results.filter(Boolean);

row.querySelector("#years").innerHTML = availableYears.join('');
row.querySelector("#year").disabled = false;
}
async function trims(el) {
  const row = el.closest(".vehicle-row");

  const makeRaw = row.querySelector("#make").value.toLowerCase();
  const modelRaw = row.querySelector("#model").value.toLowerCase();
  const year = el.value;

  if (!makeRaw || !modelRaw || !year) return;

  const make = makeRaw.replace(/\s+/g, "-");

  try {
    const modelJson = await carQueryJSONP(
      `https://carqueryapi.com/api/0.3/?cmd=getModels&make=${make}`
    );
    
    const match = modelJson.Models.find(m =>
      m.model_name.toLowerCase() === modelRaw ||
      m.model_name.toLowerCase().includes(modelRaw)
    );

    if (!match) {
      console.log("No matching CarQuery model found");
      row.querySelector("#trim").disabled = false;
      return;
    }

    const carQueryModel = match.model_name.toLowerCase().replace(/\s+/g, "-");

    const trimJson = await carQueryJSONP(
      `https://carqueryapi.com/api/0.3/?cmd=getTrims&make=${make}&model=${carQueryModel}&year=${year}`
    );
    
    console.log(trimJson.Trims);

    const trims = (trimJson.Trims || [])
      .map(t => t.model_trim)
      .filter(Boolean);

    row.querySelector("#trims").innerHTML =
      trims.map(t => `<option value="${t}">`).join('');

    const currentTrim = row.querySelector("#trim");
    currentTrim.disabled = false;
    currentTrim.focus();

  } catch (e) {
    console.log("Error!", e);
    row.querySelector("#trim").disabled = false;
  }
}
function addVehicle() {
  const container = document.getElementById("form-container");
  if (container.children.length >= 2) return;
  const firstRow = container.children[0];
  const newRow = firstRow.cloneNode(true);
  newRow.querySelectorAll("input").forEach(input => {
    input.value = "";
    input.disabled = true;
  });
  newRow.querySelector("#make").disabled = false;
const removeBtn = document.createElement("button");
  removeBtn.textContent = "Remove Vehicle";
  removeBtn.type = "button";
  removeBtn.className = "remove-btn";

  removeBtn.onclick = function () {
    newRow.remove();
    const wrapper = document.getElementById("form-wrapper");
    const addBtn = document.createElement("button");
    addBtn.textContent = "+ Add Vehicle";
    addBtn.type = "button";
    addBtn.className = "add-vehicle-btn";
    addBtn.onclick = addVehicle;
    wrapper.appendChild(addBtn);
  };
  newRow.appendChild(removeBtn);
  container.appendChild(newRow);
  const btn = document.querySelector(".add-vehicle-btn");
  if (btn) btn.remove();
}
function showVehicle(btn) {
  const row = btn.closest(".vehicle-row");

  const make = row.querySelector("#make").value;
  const model = row.querySelector("#model").value;
  const year = row.querySelector("#year").value;

  if (!make || !model) {
    alert("Please enter at least make and model");
    return;
  }

  const query = `${year} ${make} ${model}`;

  const imageUrl = `https://source.unsplash.com/600x400/?${encodeURIComponent(make)}+${encodeURIComponent(model)}+car`;

  const output = document.getElementById("vehicle-output");

  output.innerHTML = `
    <h2>${query}</h2>
    <img src="${imageUrl}" alt="${query}" 
      style="max-width:100%; border-radius:10px;"
      onerror="this.onerror=null; this.src='https://via.placeholder.com/600x400?text=No+Image';">
  `;

  const fields = row.querySelectorAll("input, label");
  fields.forEach(el => el.style.display = "none");

  if (!row.querySelector(".remove-btn")) {
    const removeBtn = document.createElement("button");
    removeBtn.textContent = "Remove Vehicle";
    removeBtn.className = "remove-btn";

    removeBtn.onclick = function () {
      output.innerHTML = "";

      fields.forEach(el => el.style.display = "block");

      removeBtn.remove();
    };

    row.appendChild(removeBtn);
  }
}
   
