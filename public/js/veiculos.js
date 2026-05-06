import { db } from './firebase.js';
import { collection, getDocs, query, where } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', async () => {
  const veiculosTableBody = document.getElementById('veiculos-table-body');

  if (veiculosTableBody) {
    try {
      const q = query(collection(db, "veiculos"), where("ativo", "==", true));
      const querySnapshot = await getDocs(q);

      querySnapshot.forEach((doc) => {
        const veiculo = doc.data();
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${veiculo.placa}</td>
          <td>${veiculo.modelo}</td>
          <td>${veiculo.cor}</td>
          <td>${veiculo.tipo}</td>
        `;
        veiculosTableBody.appendChild(row);
      });
    } catch (error) {
      console.error("Erro ao buscar veículos: ", error);
    }
  }
});
