const cart = [];
const history = [];

const essentials = ["商品A", "商品B", "商品C", "商品D", "商品E", "商品F"];
const consumables = ["商品1", "商品2", "商品3", "商品4", "商品5"];

function getRandomPrice() {
  return Math.floor(Math.random() * 41) * 100 + 1000;
}

function renderProducts() {
  const essentialList = document.getElementById("essentialList");
  const consumableList = document.getElementById("consumableList");

  essentialList.innerHTML = "";
  consumableList.innerHTML = "";

  essentials.forEach(name => {
    const price = getRandomPrice();
    essentialList.innerHTML += `
      <div class="product">
        <button class="essential-btn" onclick="addToCart('${name}', ${price})">${name}</button>
        <span>￥${price}</span>
      </div>`;
  });

  consumables.forEach(name => {
    const price = getRandomPrice();
    consumableList.innerHTML += `
      <div class="product">
        <button class="consumable-btn" onclick="addToCart('${name}', ${price})">${name}</button>
        <span>￥${price}</span>
      </div>`;
  });
}

function addToCart(name, price) {
  const existing = cart.find(item => item.name === name && item.price === price);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ name, price, qty: 1 });
  }
  renderCart();
}

function removeFromCart(index) {
  cart.splice(index, 1);
  renderCart();
}

function renderCart() {
  const cartItems = document.getElementById("cartItems");
  const totalEl = document.getElementById("total");
  cartItems.innerHTML = "";
  let total = 0;

  cart.forEach((item, index) => {
    const itemTotal = item.price * item.qty;
    cartItems.innerHTML += `
      <div class="cart-item">
        <span>${item.name}（×${item.qty}）</span>
        <span>
          ￥${itemTotal}
          <button class="small-btn" onclick="removeFromCart(${index})">削除</button>
        </span>
      </div>`;
    total += itemTotal;
  });

  totalEl.innerText = total;
}

function checkout() {
  if (cart.length === 0) {
    alert("カートが空です！");
    return;
  }

  const now = new Date();
  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const purchase = {
    date: now.toLocaleString(),
    items: [...cart],
    total
  };
  history.push(purchase);
  cart.length = 0;
  renderCart();
  renderHistory();
  alert("支払いが完了しました！");

  // ✅ Excel 自動保存
  exportHistoryToExcel();
}

function deleteHistory(index) {
  if (confirm("この支払い履歴を削除しますか？")) {
    history.splice(index, 1);
    renderHistory();
  }
}

function renderHistory() {
  const historyEl = document.getElementById("historyList");
  historyEl.innerHTML = "";
  history.forEach((entry, index) => {
    const items = entry.items.map(item => `${item.name} ×${item.qty}`).join("、");
    historyEl.innerHTML += `
      <div class="history-item">
        <div>
          <strong>${entry.date}</strong><br>
          商品: ${items}<br>
          合計: ￥${entry.total}
        </div>
        <button class="small-btn" onclick="deleteHistory(${index})">削除</button>
      </div>
    `;
  });
}

function exportHistoryToExcel() {
  if (history.length === 0) {
    alert("保存する履歴がありません。");
    return;
  }

  const wsData = [["日付", "商品", "数量", "価格", "小計"]];
  history.forEach(entry => {
    entry.items.forEach(item => {
      wsData.push([
        entry.date,
        item.name,
        item.qty,
        item.price,
        item.price * item.qty
      ]);
    });
    wsData.push(["", "", "", "合計", entry.total]);
    wsData.push([]);
  });

  const worksheet = XLSX.utils.aoa_to_sheet(wsData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "履歴");

  const dateStr = new Date().toISOString().split("T")[0];
  XLSX.writeFile(workbook, `支払い履歴_${dateStr}.xlsx`);
}

renderProducts();