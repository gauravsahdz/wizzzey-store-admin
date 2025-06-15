
import PageHeader from '@/components/PageHeader';
import BrandForm from '../components/BrandForm';
import BackButton from '@/components/BackButton';

export default function NewBrandPage() {
  return (
    <>
      <BackButton defaultHref="/brands" />
      <PageHeader
        title="Add New Brand"
        description="Create a new brand for your store."
      />
      <BrandForm />
    </>
  );
}
