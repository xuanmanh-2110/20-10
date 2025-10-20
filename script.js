// Danh sách các phần thưởng/vị trí trên vòng quay
const items = [
    "Thưởng 1", "Thưởng 2", "Thưởng 3", "Thưởng 4",
    "Thưởng 5", "Thưởng 6", "Thưởng 7", "Thưởng 8"
];

const colors = [
    "#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0",
    "#9966FF", "#FF9F40", "#C9CBCF", "#2ecc71"
];

const wheel = document.getElementById("wheel");
const ctx = wheel.getContext("2d");
const spinBtn = document.getElementById("spin");
const resultDiv = document.getElementById("result");
const nameForm = document.getElementById("name-form");
const nameInput = document.getElementById("player-name");
let playerName = "";

const radius = wheel.width / 2;
let angle = 0;
let spinning = false;

function drawWheel() {
    ctx.clearRect(0, 0, wheel.width, wheel.height);
    const arc = 2 * Math.PI / items.length;
    for (let i = 0; i < items.length; i++) {
        ctx.beginPath();
        ctx.moveTo(radius, radius);
        ctx.arc(radius, radius, radius, i * arc + angle, (i + 1) * arc + angle);
        ctx.fillStyle = colors[i % colors.length];
        ctx.fill();
        ctx.save();
        ctx.translate(radius, radius);
        ctx.rotate(i * arc + arc / 2 + angle);
        ctx.textAlign = "right";
        ctx.fillStyle = "#fff";
        ctx.font = "bold 18px Arial";
        ctx.fillText(items[i], radius - 20, 8);
        ctx.restore();
    }
    // Vẽ mũi tên
    ctx.save();
    ctx.translate(radius, radius);
    ctx.beginPath();
    ctx.moveTo(0, -radius + 10);
    ctx.lineTo(-16, -radius + 40);
    ctx.lineTo(16, -radius + 40);
    ctx.closePath();
    ctx.fillStyle = "#e74c3c";
    ctx.fill();
    ctx.restore();
}

drawWheel();

// Xử lý lưu tên người quay
nameForm.addEventListener("submit", function (e) {
    e.preventDefault();
    playerName = nameInput.value.trim();
    resultDiv.textContent = "";
    if (playerName) {
        nameForm.querySelector("button[type='submit']").textContent = "Lưu";
        nameForm.style.opacity = "1";
        // Kiểm tra nếu đã quay thì hiển thị kết quả và nút mở lại thiệp
        if (localStorage.getItem("spun_" + playerName)) {
            const prize = localStorage.getItem("prize_" + playerName);
            if (prize) {
                resultDiv.textContent = "Kết quả: " + prize;
                const btn = document.createElement("button");
                btn.textContent = "Mở lại thiệp";
                btn.className = "reopen-card-btn";
                btn.onclick = function () {
                    showCard(items.indexOf(prize));
                };
                resultDiv.appendChild(document.createElement("br"));
                resultDiv.appendChild(btn);
            }
        }
    }
});

// Nếu chưa nhập tên, không cho quay
spinBtn.onclick = function () {
    if (!playerName) {
        alert("Vui lòng nhập tên người quay trước khi quay!");
        nameInput.focus();
        return;
    }
    // Kiểm tra đã quay chưa
    if (localStorage.getItem("spun_" + playerName)) {
        alert("Bạn chỉ được quay 1 lần!");
        return;
    }
    if (spinning) return;
    spinning = true;
    resultDiv.textContent = "";

    // Chọn phần thưởng theo tỉ lệ
    let total = ratios.reduce((a, b) => a + b, 0);
    let rand = Math.random() * total;
    let acc = 0, idx = 0;
    for (let i = 0; i < ratios.length; i++) {
        acc += ratios[i];
        if (rand < acc) {
            idx = i;
            break;
        }
    }

    // Tính góc quay để dừng đúng phần thưởng đã chọn
    let arc = 360 / items.length;
    let stopAngle = (items.length - idx - 0.5) * arc; // Giữa phần thưởng
    let spinAngle = stopAngle + 360 * 5 + Math.random() * arc; // Quay ít nhất 5 vòng

    let start = null;
    function animate(ts) {
        if (!start) start = ts;
        let elapsed = ts - start;
        let progress = Math.min(elapsed / 4000, 1); // 4 giây
        let ease = 1 - Math.pow(1 - progress, 3); // ease out
        angle = (spinAngle * ease) * Math.PI / 180;
        drawWheel();
        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            spinning = false;
            resultDiv.textContent = "Kết quả: " + items[idx];
            localStorage.setItem("spun_" + playerName, "1");
            localStorage.setItem("prize_" + playerName, items[idx]);
            showPrizePopup(items[idx], idx);
            // Nếu thưởng là Thưởng 7 thì hiện nút mở lại thiệp
            if (items[idx] === "Thưởng 7") {
                const btn = document.createElement("button");
                btn.textContent = "Mở lại thiệp thưởng 7";
                btn.onclick = function () {
                    showCard(idx);
                };
                resultDiv.appendChild(document.createElement("br"));
                resultDiv.appendChild(btn);
            }
        }
    }
    requestAnimationFrame(animate);
};
/**
 * Hiển thị popup phần thưởng giữa màn hình với nút mở thiệp
 * prize: tên phần thưởng
 * idx: vị trí phần thưởng (dùng để lấy nội dung thiệp)
 */
function showPrizePopup(prize, idx) {
    const popup = document.createElement("div");
    popup.className = "prize-popup";
    popup.innerHTML = `
    <span>${prize}</span>
    <br>
    <button class="open-card-btn">Mở thiệp</button>
    `;
    document.body.appendChild(popup);
    setTimeout(() => {
        popup.classList.add("show");
    }, 10);

    const btn = popup.querySelector(".open-card-btn");
    btn.onclick = function () {
        showCard(idx);
        popup.classList.remove("show");
        setTimeout(() => document.body.removeChild(popup), 400);
    };
}

/**
 * Hiển thị thiệp chúc mừng 20/10 cho từng phần thưởng
 * idx: vị trí phần thưởng (dùng để lấy nội dung thiệp)
 */
function showCard(idx) {
    const card = document.createElement("div");
    card.className = "card-popup";
    card.innerHTML = `
    <div class="card-content">
      <h2>Chúc mừng 20/10!</h2>
      <p>${cards[idx]}</p>
      <button class="close-card-btn">Đóng</button>
    </div>
  `;
    document.body.appendChild(card);
    setTimeout(() => {
        card.classList.add("show");
    }, 10);

    card.querySelector(".close-card-btn").onclick = function () {
        card.classList.remove("show");
        setTimeout(() => document.body.removeChild(card), 400);
    };
}
// Danh sách thiệp cho từng phần thưởng
const cards = [
    "Bông hoa 1: Chúc bạn luôn tỏa sáng như ánh mặt trời buổi sớm! Dù ở đâu, hãy cứ mỉm cười thật tươi, lan tỏa năng lượng tích cực và khiến mọi người xung quanh cảm thấy ấm áp. Hôm nay là ngày của bạn — hãy sống trọn niềm vui nhé!",
    "Bông hoa 2: Chúc bạn gặt hái thật nhiều thành công trong mọi lĩnh vực mà bạn đam mê. Dù là công việc, học tập hay cuộc sống, hãy luôn tin rằng nỗ lực của bạn rồi sẽ được đền đáp xứng đáng. Tự tin và tiếp tục tiến bước nhé!",
    "Bông hoa 3: Chúc bạn nhận được thật nhiều niềm vui và những điều bất ngờ dễ thương trong ngày hôm nay! Cuộc sống đôi khi đơn giản chỉ cần một nụ cười, một lời chúc, hay một ánh mắt thân thương — và bạn xứng đáng có tất cả những điều ấy!",
    "Bông hoa 4: Chúc bạn luôn xinh đẹp, rạng rỡ và tự tin trong mọi khoảnh khắc. Không chỉ là vẻ đẹp bên ngoài, mà còn là ánh sáng tỏa ra từ tâm hồn — nơi chứa đầy yêu thương, kiên cường và lòng tốt của bạn.",
    "Bông hoa 5: Chúc bạn gặp thật nhiều may mắn và thuận lợi trên con đường phía trước. Dù có đôi lúc thử thách, hãy luôn giữ niềm tin và nụ cười, vì điều tốt đẹp sẽ đến với người biết kiên trì và yêu cuộc sống!",
    "Bông hoa 6: Chúc bạn luôn được yêu thương và trân trọng bởi những người xung quanh. Dù ở bất kỳ nơi đâu, hy vọng bạn luôn cảm nhận được hơi ấm của tình thân, tình bạn và những mối quan hệ chân thành.",
    "Bông hoa 7: Chúc bạn vững bước trên hành trình chinh phục ước mơ của mình. Mỗi ngày là một cơ hội mới để bạn tiến gần hơn đến điều bạn mong muốn — chỉ cần bạn tin vào chính mình, không gì là không thể!",
    "Bông hoa 8: Chúc bạn có một ngày 20/10 thật trọn vẹn và đáng nhớ! Hãy cho phép bản thân tận hưởng những điều ngọt ngào, những lời yêu thương và những khoảnh khắc bình yên. Bạn xứng đáng với tất cả những điều tốt đẹp nhất!"
];
// Tỉ lệ xuất hiện cho từng phần thưởng (tổng các số là 100)
const ratios = [10, 10, 10, 10, 10, 10, 20, 20]; // Ví dụ: Thưởng 7 và 8 dễ ra hơn