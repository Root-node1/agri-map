import FieldCard from "./FieldCard";

export default function ActiveFieldsSection({
  fields = [],
}) {
  return (
    <section>
      <h2 className="mb-3 text-xl font-bold">
        Active Fields
      </h2>

      <div className="space-y-3">
        {fields.map((field) => (
          <FieldCard
            key={field.id}
            field={field}
          />
        ))}
      </div>
    </section>
  );
}