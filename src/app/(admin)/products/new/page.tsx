
import PageHeader from '@/components/PageHeader';
import ProductForm from '../components/ProductForm';
import BackButton from '@/components/BackButton';

export default function NewProductPage() {
  return (
    <>
      <BackButton defaultHref="/products" />
      <PageHeader
        title="Add New Product"
        description="Fill in the details to add a new product to your store."
      />
      <ProductForm />
    </>
  );
}
