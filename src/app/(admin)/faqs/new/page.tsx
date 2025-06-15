
import PageHeader from '@/components/PageHeader';
import FaqForm from '../components/FaqForm';
import BackButton from '@/components/BackButton';

export default function NewFaqPage() {
  return (
    <>
      <BackButton defaultHref="/faqs" />
      <PageHeader
        title="Add New FAQ"
        description="Create a new frequently asked question."
      />
      <FaqForm />
    </>
  );
}
