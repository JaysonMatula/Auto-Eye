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

async function models() {
  const make = document.getElementById("make").value;
  try {
    const response = await fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/GetModelsForMake/${make}?format=json`);
    const data = await response.json();

   let modelOutput = `
      ${data.Results.map(function (item){
        return `<option value="${item.Model_Name}">`;
      }).join('')}`;

    document.getElementById("models").innerHTML = modelOutput;
    document.getElementById("model").disabled = false;
    
    } catch (e) {
  console.log("Error!")
  }
}


async function years() {
  const make = document.getElementById("make").value;
  const model = document.getElementById("model").value;
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

document.getElementById("years").innerHTML = availableYears.join('');
document.getElementById("year").disabled = false;
}
async function trims() {
  const make = document.getElementById("make").value.toLowerCase().replace(/\s+/g, "-");
  let model = document.getElementById("model").value.toLowerCase();
  model = model.replace(/\s+/g, "-");
  const year = document.getElementById("year").value;

  if (!make || !model || !year) return;

  try {
    const response = await fetch(
      `https://www.carqueryapi.com/api/0.3/?cmd=getTrims&make=${make}&model=${model}&year=${year}`
    );
    const text = await response.text();
    const json = JSON.parse(
      text.replace("var carquery = ", "").replace(/;$/, "")
    );
    const trims = (json.Trims || []).map(t => t.model_trim).filter(Boolean);
    document.getElementById("trims").innerHTML =
      trims.map(t => `<option value="${t}">`).join('');
    const currentTrim = document.getElementById("trim");
    currentTrim.disabled = false;
    currentTrim.focus();
  } catch (e) {
    console.log("Error!", e);
    document.getElementById("trim").disabled = false;
  }
}
function addVehicle() {
  const container = document.getElementById("form-container");
  const firstRow = container.children[0];
  const newRow = firstRow.cloneNode(true);
  newRow.querySelectorAll("input").forEach(input => {
    input.value = "";
    input.disabled = true;
  });
  const firstInput = newRow.querySelector("input");
  if (firstInput) firstInput.disabled = false;
  container.appendChild(newRow);
}
document.addEventListener("change", function (e) {
    if (e.target.id === "trim") {
      if (e.target.value && !e.target.dataset.added) {
        e.target.dataset.added = "true";
        addVehicle();
      }
    }
  });
