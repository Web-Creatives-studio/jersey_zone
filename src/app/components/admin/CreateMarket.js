"use client";
import React, { useState } from "react";
import { FaTimes } from "react-icons/fa";
import { toast } from "react-toastify";

export default function CreateMarket({
  setCreateMarket,
  editingAutomation = null,
}) {
  const [name, setName] = useState(editingAutomation?.name || "");
  const [category, setCategory] = useState(
    editingAutomation?.category || "MARKETING",
  );
  const [triggerType, setTriggerType] = useState(
    editingAutomation?.triggerType || "IMMEDIATE",
  );
  const [delayInHours, setDelayInHours] = useState(
    editingAutomation?.delayInHours || 0,
  );
  const [scheduledFor, setScheduledFor] = useState(
    editingAutomation?.scheduledFor
      ? new Date(editingAutomation.scheduledFor).toISOString().slice(0, 16)
      : "",
  );
  const [subject, setSubject] = useState(editingAutomation?.subject || "");
  const [htmlContent, setHtmlContent] = useState(
    editingAutomation?.htmlContent || "",
  );
  const [imageUrl, setImageUrl] = useState("");
  const [images, setImages] = useState(editingAutomation?.images || []);
  const [isSaving, setIsSaving] = useState(false);

  const addImageAsset = () => {
    if (imageUrl.trim()) {
      setImages([...images, imageUrl.trim()]);
      setImageUrl("");
    }
  };

  const handleSavePipeline = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const payload = {
        id: editingAutomation?.id, // Present only when editing an existing item
        name,
        category,
        triggerType,
        delayInHours,
        scheduledFor,
        subject,
        htmlContent,
        images,
      };

      const res = await fetch("/api/marketing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success("Pipeline engine rule saved successfully!");
        setCreateMarket(false);
      }
    } catch (err) {
      toast.error("Pipeline transmission failed.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40" />
      {/* Drawer Container */}

      <form
        onSubmit={handleSavePipeline}
        className="fixed top-0 right-0 h-screen w-full sm:w-[500px] bg-white shadow-2xl z-50 flex flex-col  max-w-2xl   p-6 space-y-5 text-slate-800"
      >
        <div className="flex justify-between items-center border-b pb-3">
          <h2 className="text-xl font-bold tracking-tight text-zinc-900">
            {editingAutomation
              ? "Modify Existing Automation Rule"
              : "Initialize New Email Pipeline"}
          </h2>
          <button
            type="button"
            onClick={() => setCreateMarket(false)}
            className="text-slate-400 hover:text-zinc-900 font-bold p-2"
          >
            <FaTimes />
          </button>
        </div>
        <div className="overflow-y-auto h-screen">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-slate-400">
                Campaign/Flow Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full mt-1 p-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none focus:border-orange-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-slate-400">
                Target Category Group
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full mt-1 p-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none"
              >
                <option value="WELCOME">WELCOME (Signups)</option>
                <option value="TRANSACTIONAL">TRANSACTIONAL (Orders)</option>
                <option value="ABANDONMENT">ABANDONMENT (Carts)</option>
                <option value="MARKETING">MARKETING (Campaign/Monthly)</option>
                <option value="SUPPORT">SUPPORT (Chat notifications)</option>
              </select>
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl space-y-3 border border-slate-100">
            <label className="block text-xs font-bold uppercase tracking-wide text-slate-400">
              Trigger Matrix Delivery Strategy
            </label>
            <div className="flex gap-4 text-sm font-semibold">
              {["IMMEDIATE", "DELAYED", "SCHEDULED"].map((type) => (
                <label
                  key={type}
                  className="flex items-center space-x-2 cursor-pointer"
                >
                  <input
                    type="radio"
                    checked={triggerType === type}
                    onChange={() => setTriggerType(type)}
                    className="accent-orange-500"
                  />
                  <span>{type}</span>
                </label>
              ))}
            </div>

            {triggerType === "DELAYED" && (
              <div className="pt-2 animate-slideDown">
                <label className="block text-xs font-medium text-slate-500">
                  Wait Duration (Hours after database interaction event)
                </label>
                <input
                  type="number"
                  min={1}
                  value={delayInHours}
                  onChange={(e) => setDelayInHours(parseInt(e.target.value))}
                  className="mt-1 p-2 w-32 border border-slate-200 rounded-lg text-sm bg-white"
                />
              </div>
            )}

            {triggerType === "SCHEDULED" && (
              <div className="pt-2 animate-slideDown">
                <label className="block text-xs font-medium text-slate-500">
                  Calendar Release Blueprint Timestamp
                </label>
                <input
                  type="datetime-local"
                  value={scheduledFor}
                  onChange={(e) => setScheduledFor(e.target.value)}
                  className="mt-1 p-2 border border-slate-200 rounded-lg text-sm bg-white text-slate-700"
                  required
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-slate-400">
              Visual Marketing Image Link Asset
            </label>
            <div className="flex gap-2 mt-1">
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://res.cloudinary.com/..."
                className="flex-1 p-2 border border-slate-200 rounded-lg text-sm bg-slate-50"
              />
              <button
                type="button"
                onClick={addImageAsset}
                className="px-3 bg-zinc-900 text-white text-xs font-bold rounded-lg hover:bg-orange-600 transition"
              >
                Attach
              </button>
            </div>
            {images.length > 0 && (
              <div className="flex gap-2 mt-2 flex-wrap">
                {images.map((img, i) => (
                  <div
                    key={i}
                    className="text-xs bg-orange-50 border border-orange-200 text-orange-700 px-2 py-1 rounded flex items-center gap-1"
                  >
                    <span className="truncate max-w-[150px]">{img}</span>
                    <button
                      type="button"
                      onClick={() =>
                        setImages(images.filter((_, idx) => idx !== i))
                      }
                      className="font-bold text-red-500"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-slate-400">
                Outbound Email Subject Line
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full mt-1 p-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none focus:border-orange-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-slate-400">
                Email Template Layout Structure Content (HTML String)
              </label>
              <textarea
                rows={10}
                value={htmlContent}
                onChange={(e) => setHtmlContent(e.target.value)}
                className="w-full mt-1 p-2 border border-slate-200 rounded-lg font-mono text-xs bg-slate-50 focus:outline-none focus:border-orange-500"
                placeholder="<div>Hello {{name}}, ...</div>"
                required
              />
            </div>
          </div>
        </div>
        <div className="border-t p-4 bg-gray-50 flex items-center justify-between">
          <button
            type="submit"
            disabled={isSaving}
            className="w-full py-3 bg-orange-600 hover:bg-zinc-900 text-white font-bold rounded-xl shadow-md transition duration-200 text-sm tracking-wide"
          >
            {isSaving
              ? "Saving Configuration..."
              : "Commit Pipeline Structure Changes"}
          </button>
        </div>
      </form>
    </>
  );
}
