# ⚡ SolarSmart.AI  
*AI-Powered Solar Performance & Predictive Analytics*  

![SolarSmart.AI Banner](https://in.images.search.yahoo.com/images/view;_ylt=AwrKBI8bvc5oOLchXhW9HAx.;_ylu=c2VjA3NyBHNsawNpbWcEb2lkAzdjMjkzMjU0MjNiMjJhMmIxMmU1YWJiNDg1MTM3YjVlBGdwb3MDNQRpdANiaW5n?back=https%3A%2F%2Fin.images.search.yahoo.com%2Fsearch%2Fimages%3Fp%3Dsolarsmart.ai%26type%3DE210IN885G91938%26fr%3Dmcafee%26fr2%3Dpiv-web%26tab%3Dorganic%26ri%3D5&w=2000&h=1333&imgurl=img.freepik.com%2Fpremium-photo%2Fsolar-panel-cell-smart-grid-ai-generated_499459-888.jpg%3Fw%3D2000&rurl=https%3A%2F%2Fwww.freepik.com%2Fpremium-ai-image%2Fsolar-panel-cell-smart-grid-ai-generated_62528280.htm&size=220KB&p=solarsmart.ai&oid=7c29325423b22a2b12e5abb485137b5e&fr2=piv-web&fr=mcafee&tt=Premium+AI+Image+%7C+Solar+panel+cell+smart+grid+AI+generated&b=0&ni=21&no=5&ts=&tab=organic&sigr=geoyNYcJXKc.&sigb=D2A7.C0hknE0&sigi=brAg20kzlOm3&sigt=vXGxzYC.U1JE&.crumb=BbZB7qik6/R&fr=mcafee&fr2=piv-web&type=E210IN885G91938)  

---

## 🌍 Overview  
**SolarSmart.AI** is an **AI-driven solar energy analytics platform** designed to monitor, analyze, and predict solar performance.  
It empowers homeowners, businesses, and utility providers to optimize solar usage through **machine learning, predictive modeling, and real-time insights**.  

---

## 🚀 Features  
- 📊 **Real-time monitoring** of solar power output  
- 🔍 **Anomaly detection** for solar panel health & efficiency  
- 🤖 **Predictive AI model** (`solar_model.joblib`) for performance forecasting  
- 📈 **Interactive dashboards** for energy trends and savings  
- ☁️ **Cloud-ready architecture** for large-scale solar infrastructures  

---

## 🏗️ Tech Stack  
- **Frontend / App**: React
- **Backend**: Python (FastAPI)  
- **Machine Learning**: scikit-learn, pandas, numpy, joblib  
- **Data Handling**: CSV/SQL, APIs for live solar data   

---

## 📦 Installation  

Clone the repo:  
```bash
git clone https://github.com/Rugwed01/SolarSmart.AI.git
cd SolarSmart.AI
````

Install dependencies:

```bash
# Python dependencies
pip install -r requirements.txt  

# Node dependencies
npm install  
```

---

## ⚙️ Setup

1. **Create an `.env` file** in the root directory with your environment variables (example):

   ```env
   API_KEY=your_api_key_here
   DB_URL=your_database_url_here
   ```

3. **Run the app**:

Run these commands in two separate terminals.

   ```bash
   uvicorn main:app --reload
   ```

   and:

   ```bash
   npm run dev
   ```
---

## 🧠 Model Training

To retrain the ML model locally:

```bash
python train.py
```

This will create a `solar_model.joblib`.

---

## 📂 Project Structure

```
SolarSmart.AI/
│── app.py               # Main application script
│── train.py             # Model training script
│── requirements.txt     # Python dependencies
│── package.json         # Node dependencies (if frontend included)
│── models/              # Place your solar_model.joblib here
│── data/                # Datasets
│── src/                 # Core modules & utilities
```

---

## 👨‍💻 Contributors

* Rugwed Yawalkar
* Ameen Khan
* Pawan Hete
* Arya Dashputra
* Himanshu Sayankar

---

## 🤝 Acknowledgements

This project was proudly showcased at **Shell’s Changemakers of Tomorrow 2025** under the **Startup Theme (Skills4Future)**, where it received recognition from **global leaders in clean energy and innovation**.

---

## 📜 License

This project is licensed under the [MIT License](LICENSE).
Feel free to use, modify, and share responsibly.

---

🌱 *SolarSmart.AI – Powering a Sustainable Future with Data & Intelligence* ⚡
