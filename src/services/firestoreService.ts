import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  query,
  orderBy
} from "firebase/firestore";

import { db } from "../firebase";

export interface Trip {
  id?: string;
  veiculo: string;
  motorista: string;
  seguranca: string;
  kmSaida: number;
  destino: string;
  dataSaida: string;
  status: string;
  kmRetorno?: number;
  kmRodado?: number;
  dataRetorno?: string;
}

export interface ReferenceData {
  veiculos: string[];
  motoristas: string[];
  segurancas: string[];
}

export const firestoreService = {

  async getReferenceData(): Promise<ReferenceData> {
    try {

      const veiculosSnap = await getDocs(collection(db, "veiculos"));
      const motoristasSnap = await getDocs(collection(db, "motoristas"));
      const segurancasSnap = await getDocs(collection(db, "segurancas"));

      return {
        veiculos: veiculosSnap.docs.map(doc => doc.data().nome || ""),
        motoristas: motoristasSnap.docs.map(doc => doc.data().nome || ""),
        segurancas: segurancasSnap.docs.map(doc => doc.data().nome || "")
      };

    } catch (error) {
      console.error("Erro getReferenceData:", error);

      return {
        veiculos: [],
        motoristas: [],
        segurancas: []
      };
    }
  },

  async getTrips(): Promise<Trip[]> {

    try {

      const q = query(
        collection(db, "movimentacoes_frota"),
        orderBy("dataSaida", "desc")
      );

      const snap = await getDocs(q);

      return snap.docs.map(docItem => ({
        id: docItem.id,
        ...docItem.data()
      })) as Trip[];

    } catch (error) {

      console.error("Erro getTrips:", error);
      return [];
    }
  },

  async saveTrip(data: any) {

    try {

      await addDoc(collection(db, "movimentacoes_frota"), {
        ...data,
        kmSaida: Number(data.kmSaida),
        dataSaida: new Date().toISOString(),
        status: "Em Viagem"
      });

      return true;

    } catch (error) {

      console.error("Erro saveTrip:", error);
      return false;
    }
  },

  async finishTrip(
    id: string,
    kmRetorno: number,
    updatedData?: Partial<Trip>
  ) {

    try {

      const ref = doc(db, "movimentacoes_frota", id);

      const kmSaida =
        updatedData?.kmSaida || 0;

      await updateDoc(ref, {
        kmRetorno,
        kmRodado: Number(kmRetorno) - Number(kmSaida),
        dataRetorno: new Date().toISOString(),
        status: "Concluído",
        ...updatedData
      });

      return true;

    } catch (error) {

      console.error("Erro finishTrip:", error);
      return false;
    }
  }
};
