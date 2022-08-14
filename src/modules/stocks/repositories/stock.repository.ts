import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { Stock, StockOption } from '../entities/stock';

@Injectable()
export class StockRepository {

  findByProduct(productId: string) {
    return admin.firestore()
      .collection('stocks')
      .where('productId', '==', productId)
      .get()
      .then(snapshot => {
        if (snapshot.empty) {
          return null;
        }
        return <Stock> snapshot.docs[0].data();
      });
  }

  async updateStockOption(update: UpdateStockOption) {
    const batch = admin.firestore().batch();
    
    this.removeOriginalStockOption(update.stockId, update.originalStockOption, batch);
    this.addNewStockOption(update.stockId, update.stockOption, batch);

    return await batch.commit();
  }

  private removeOriginalStockOption(
    stockId: string, stockOption: StockOption, batch: admin.firestore.WriteBatch
  ){
    const removeRef = admin.firestore()
      .collection('stocks')
      .doc(stockId);

    batch.update(removeRef, {
      stockOptions: admin.firestore.FieldValue.arrayRemove(
        JSON.parse(JSON.stringify(stockOption))
      )
    });
  }

  private addNewStockOption(
    stockId: string, stockOption: StockOption, batch: admin.firestore.WriteBatch
  ) {
    const updateRef = admin.firestore()
      .collection('stocks')
      .doc(stockId);

    batch.update(updateRef, {
      stockOptions: admin.firestore.FieldValue.arrayUnion(
        JSON.parse(JSON.stringify(stockOption))
      )
    });
  }

}

type UpdateStockOption = {
  stockId: string;
  originalStockOption: StockOption;
  stockOption: StockOption;
}