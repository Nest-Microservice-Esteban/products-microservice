import { Injectable, Logger, NotFoundException, OnModuleInit } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaClient } from '@prisma/client';
import { PaginationDto } from 'src/common';

@Injectable()
export class ProductsService extends PrismaClient implements OnModuleInit {

  private readonly logger = new Logger('ProductService');

  async onModuleInit() {
    await this.$connect();
    this.logger.log('Database Conected');
  }


  async create(createProductDto: CreateProductDto) {
    const product = await this.product.create({
      data: createProductDto
    })
    return product;
  }

  async findAll(paginationDto:PaginationDto) {
    const {limit,page} = paginationDto;
    const totalPages = await this.product.count({where:{available:true}});
    const lastPage = Math.ceil(totalPages / limit);

    const products = await this.product.findMany({
      where:{available:true},
      skip:(page-1)*limit,
      take: limit
    });

    return {
      data:products,
      meta:{
        pages:totalPages,
        page:page,
        lastPage:lastPage
      }
    };
  }

  async findOne(id: number) {
    const product = await this.product.findFirst({
      where:{
        id:id,
        available:true,
      }
    });
    if(!product) throw new NotFoundException(`Product with id: ${id} not found`);
    return product;
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    const{id:__,...data}=updateProductDto;
    await this.findOne(id);
    const product = await this.product.update({
      where:{
        id:id
      },
      data:data
    })
    return product;
  }

  async remove(id: number) {
    await this.findOne(id);

    const product = await this.product.update({
      where:{id:id},
      data:{
        available:false
      }
    });

    return product;
    // return this.product.delete({ eliminacion en duro no recomendable
    //   where:{
    //     id:id
    //   }
    // });
  }
}
