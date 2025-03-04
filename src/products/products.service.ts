import { HttpStatus, Injectable, Logger, NotFoundException, OnModuleInit } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaClient } from '@prisma/client';
import { PaginationDto } from 'src/common';
import { RpcException } from '@nestjs/microservices';

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
    if(!product) throw new RpcException({
      message:`Product with id: ${id} not found`,
      status:HttpStatus.BAD_REQUEST
    });
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

  async validateProducts(ids: number[]){
    ids = Array.from( new Set(ids) ); // aqui se quita los id iguales porque Set elimina los duplicados
    const products = await this.product.findMany({ // este metodo traeram todos los ids que existan en base de datos
      where:{
        id:{
          in: ids
        }
      }
    });
    if(products.length != ids.length) throw new RpcException({message:`Some products were not found`, status: HttpStatus.BAD_REQUEST});

    return products;
  }
}
