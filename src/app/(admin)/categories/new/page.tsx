
import PageHeader from '@/components/PageHeader';
import CategoryForm from '../components/CategoryForm';
import BackButton from '@/components/BackButton';

export default function NewCategoryPage() {
  return (
    <>
      <BackButton defaultHref="/categories"/>
      <PageHeader
        title="Add New Category"
        description="Create a new category for your products."
      />
      <CategoryForm />
    </>
  );
}
