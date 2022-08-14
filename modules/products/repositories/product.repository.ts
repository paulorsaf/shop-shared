import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { Product } from '../entities/product';

@Injectable()
export class ProductRepository {

  constructor(
  ) {}

  async findById(productId: string) {
    return admin.firestore()
      .collection('products')
      .doc(productId)
      .get()
      .then(snapshot => (<Product> {
        ...snapshot.data(),
        id: snapshot.id
      }));
  }

  async updateStockAmount(update: UpdateProductStock) {
    return admin.firestore()
      .collection('products')
      .doc(update.productId)
      .update({
        stock: update.amount
      });
  }

}

type UpdateProductStock = {
  amount: number;
  productId: string;
}