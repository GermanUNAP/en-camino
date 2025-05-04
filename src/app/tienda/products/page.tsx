type ProductsProps = {
    idStore: any; 
};
  
  export default function Products({ idStore }: ProductsProps) {
    return (
        <div>
            ID de la tienda: {idStore}
        </div>
    );
  }
  