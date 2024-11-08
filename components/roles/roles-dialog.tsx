"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Role, RoleFormData } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import * as z from "zod";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  purpose: z.string().min(1, "Purpose is required"),
  coreQualities: z.array(z.string().min(1, "Quality cannot be empty")),
  identityStatement: z.string().min(1, "Identity statement is required"),
  incantations: z.array(z.string().optional()).optional(),
  imageBlob: z.string().optional(),
});

interface RoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (role: Role) => void;
  role?: Role;
}

export function RoleDialog({
  open,
  onOpenChange,
  onSave,
  role,
}: RoleDialogProps) {
  const [imagePreview, setImagePreview] = useState(role?.imageBlob || "");

  const form = useForm<RoleFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: role?.name || "",
      description: role?.description || "",
      purpose: role?.purpose || "",
      coreQualities: role?.coreQualities || [""],
      identityStatement: role?.identityStatement || "",
      incantations: role?.incantations || [""],
      imageBlob: role?.imageBlob || "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "coreQualities",
  });

  const { fields: incantationFields, append: appendIncantation, remove: removeIncantation } = useFieldArray({
    control: form.control,
    name: "incantations",
  });

  const onSubmit = (data: RoleFormData) => {
    const newRole: Role = {
      ...role,
      ...data,
      coreQualities: data.coreQualities.filter(Boolean), // Remove empty entries
      incantations: data.incantations?.filter(Boolean), // Remove empty entries
      createdAt: role?.createdAt || new Date(),
      updatedAt: new Date(),
    };

    onSave(newRole);
    onOpenChange(false);
    form.reset();
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        form.setValue("imageBlob", base64String); // Set image data in form state
        setImagePreview(base64String); // Update image preview
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] max-h-screen overflow-y-scroll scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
        <DialogHeader>
          <DialogTitle>{role ? "Edit Role" : "Create New Role"}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Role name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Describe this role..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="purpose"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Purpose</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Purpose of this role..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <FormLabel>Core Qualities</FormLabel>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => append("")}
                >
                  <Plus className="h-6 w-6" />
                </Button>
              </div>
              {fields.map((field, index) => (
                <div key={field.id} className="flex items-center gap-2">
                  <FormField
                    control={form.control}
                    name={`coreQualities.${index}`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input placeholder="Core Quality" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => remove(index)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
            <FormField
              control={form.control}
              name="identityStatement"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Identity Statement</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Identity statement..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <FormLabel>Incantations</FormLabel>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => appendIncantation("")}
                >
                  <Plus className="h-6 w-6" />
                </Button>
              </div>
              {incantationFields.map((field, index) => (
                <div key={field.id} className="flex items-center gap-2">
                  <FormField
                    control={form.control}
                    name={`incantations.${index}`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input placeholder="Incantations" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeIncantation(index)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
            <FormField
              control={form.control}
              name="imageBlob"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                  </FormControl>
                  {imagePreview && (
                    <img
                      src={imagePreview}
                      alt="Selected Preview"
                      className="mt-2 w-32 h-32 object-cover rounded"
                    />
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Save</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
