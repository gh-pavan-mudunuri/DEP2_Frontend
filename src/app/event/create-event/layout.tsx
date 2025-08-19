import EventFormLayout from '@/components/event-form/layout';

export default function Layout({ children }: { children: React.ReactNode }) {
  return <EventFormLayout>{children}</EventFormLayout>;
}
