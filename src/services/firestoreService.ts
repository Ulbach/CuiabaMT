import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  query,
  orderBy,
  where,
  getDoc
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
      const veiculosQuery = query(
        collection(db, "veiculos"),
        where("Ativo", "==", true)
      );

      const motoristasQuery = query(
        collection(db, "motoristas"),
        where("Ativo", "==", true)
      );

      const segurancasQuery = query(
        collection(db, "segurancas"),
        where("Ativo", "==", true)
      );

      const [veiculosSnap, motoristasSnap, segurancasSnap] = await Promise.all([
        getDocs(veiculosQuery),
        getDocs(motoristasQuery),
        getDocs(segurancasQuery)
      ]);

      return {
        veiculos: veiculosSnap.docs
          .map(docItem => docItem.data().Nome || "")
          .filter(Boolean),

        motoristas: motoristasSnap.docs
          .map(docItem => docItem.data().Nome || "")
          .filter(Boolean),

        segurancas: segurancasSnap.docs
          .map(docItem => docItem.data().Nome || "")
          .filter(Boolean)
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

      return snap.docs
        .map(docItem => ({
          id: docItem.id,
          ...docItem.data()
        }))
        .filter((item: any) => item.Modelo !== true) as Trip[];

    } catch (error) {
      console.error("Erro getTrips:", error);
      return [];
    }
  },

  async saveTrip(data: any) {
    try {
      const veiculoSnap = await getDocs(
        query(
          collection(db, "veiculos"),
          where("Nome", "==", data.veiculo)
        )
      );

      if (!veiculoSnap.empty) {
        const veiculoDoc = veiculoSnap.docs[0];
        const veiculoData = veiculoDoc.data();

        if (veiculoData.Ativo !== true) {
          throw new Error("Veículo inativo.");
        }

        if (veiculoData.EmTransito === true) {
          throw new Error("Veículo já está em trânsito.");
        }

        await updateDoc(doc(db, "veiculos", veiculoDoc.id), {
          EmTransito: true
        });
      }

      await addDoc(collection(db, "movimentacoes_frota"), {
        veiculo: data.veiculo,
        motorista: data.motorista,
        seguranca: data.seguranca,
        destino: data.destino,
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
      const tripRef = doc(db, "movimentacoes_frota", id);
      const tripSnap = await getDoc(tripRef);

      if (!tripSnap.exists()) {
        throw new Error("Movimentação não encontrada.");
      }

      const tripData = tripSnap.data() as Trip;
      const kmSaida = Number(updatedData?.kmSaida ?? tripData.kmSaida ?? 0);
      const veiculoNome = updatedData?.veiculo ?? tripData.veiculo;

      await updateDoc(tripRef, {
        kmRetorno: Number(kmRetorno),
        kmRodado: Number(kmRetorno) - kmSaida,
        dataRetorno: new Date().toISOString(),
        status: "Concluído",
        ...updatedData
      });

      if (veiculoNome) {
        const veiculoSnap = await getDocs(
          query(
            collection(db, "veiculos"),
            where("Nome", "==", veiculoNome)
          )
        );

        if (!veiculoSnap.empty) {
          const veiculoDoc = veiculoSnap.docs[0];

          await updateDoc(doc(db, "veiculos", veiculoDoc.id), {
            EmTransito: false,
            KmAtualCadastro: Number(kmRetorno)
          });
        }
      }

      return true;

    } catch (error) {
      console.error("Erro finishTrip:", error);
      return false;
    }
  }
};
