import React, { useState, useRef, useEffect } from "react";
import { toPng } from "html-to-image";
import Draggable from "react-draggable";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import "./UniversalCustomizer.css";

export default function UniversalCustomizer({ category }) {
  const navigate = useNavigate();
  const [color, setColor] = useState("#ffffff");
  const [pattern, setPattern] = useState("fabric");
  const [prompt, setPrompt] = useState("");
  const [activeStickers, setActiveStickers] = useState([]);
  const [selectedStickerId, setSelectedStickerId] = useState(null);
  const [savedDesigns, setSavedDesigns] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiImage, setAiImage] = useState(null);
  
  // Category-specific options
  const [coasterShape, setCoasterShape] = useState("circle"); // circle, square, hexagon, triangle

  const productRef = useRef(null);

  // Helper to proxy image URLs for CORS
  const proxify = (url) =>
    `http://localhost:5000/api/proxy?url=${encodeURIComponent(url)}`;

  // Curated patterns
  const patterns = [
    { value: "fabric", label: "Premium Canvas", preview: proxify("https://www.transparenttextures.com/patterns/argyle.png") },
    { value: "stripes", label: "Elegant Stripes", preview: proxify("https://www.transparenttextures.com/patterns/textured-stripes.png") },
    { value: "floral", label: "Floral Bloom", preview: proxify("https://www.transparenttextures.com/patterns/flowers.png") },
    { value: "waves", label: "Ocean Waves", preview: proxify("https://www.transparenttextures.com/patterns/wavecut.png") },
    { value: "dots", label: "Retro Dots", preview: proxify("https://www.transparenttextures.com/patterns/worn-dots.png") },
    { value: "chevron", label: "Chevron", preview: proxify("https://www.transparenttextures.com/patterns/zig-zag.png") },
    { value: "cubes", label: "Psychedelic Cubes", preview: proxify("https://www.transparenttextures.com/patterns/psychedelic.png") },
    { value: "diamonds", label: "Diagmonds", preview: proxify("https://www.transparenttextures.com/patterns/diagmonds-light.png") },
    { value: "abstract", label: "Triangles", preview: proxify("https://www.transparenttextures.com/patterns/triangles.png") },
    { value: "geometric", label: "Fine Grid", preview: proxify("https://www.transparenttextures.com/patterns/grid-me.png") },
    { value: "clouds", label: "Soft Cotton", preview: proxify("https://www.transparenttextures.com/patterns/fresh-snow.png") },
    { value: "checkered", label: "Classic Checkered", preview: proxify("https://www.transparenttextures.com/patterns/checkered-pattern.png") },
    { value: "honeycomb", label: "Honeycomb Grid", preview: proxify("https://www.transparenttextures.com/patterns/light-honeycomb.png") },
    { value: "crisscross", label: "Criss Cross", preview: proxify("https://www.transparenttextures.com/patterns/vichy.png") },
    { value: "polkadots", label: "Polka Dots", preview: proxify("https://www.transparenttextures.com/patterns/circles.png") },
    { value: "wavegrid", label: "Wave Grid", preview: proxify("https://www.transparenttextures.com/patterns/wave-grid.png") },
    { value: "diagonalstripes", label: "Diagonal Stripes", preview: proxify("https://www.transparenttextures.com/patterns/subtle-stripes.png") },
    { value: "stars", label: "Night Stars", preview: proxify("https://www.transparenttextures.com/patterns/stardust.png") },
    { value: "absurdity", label: "Abstract Doodle", preview: proxify("https://www.transparenttextures.com/patterns/absurdity.png") },
  ];

  // Sticker assets
  const stickers = [
    { id: 1, src: proxify("https://img.icons8.com/color/96/flower.png") },
    { id: 2, src: proxify("https://img.icons8.com/color/96/star.png") },
    { id: 3, src: proxify("https://img.icons8.com/emoji/96/red-heart.png") },
    { id: 4, src: proxify("https://img.icons8.com/color/96/butterfly.png") },
    { id: 5, src: proxify("https://img.icons8.com/color/96/sun.png") },
    { id: 6, src: proxify("https://img.icons8.com/color/96/leaf.png") },
    { id: 7, src: proxify("https://img.icons8.com/color/96/moon.png") },
    { id: 8, src: proxify("https://img.icons8.com/color/96/cloud.png") },
    { id: 9, src: proxify("https://img.icons8.com/color/96/rainbow.png") },
    { id: 10, src: proxify("https://img.icons8.com/color/96/snowflake.png") },
    { id: 11, src: proxify("https://img.icons8.com/color/96/unicorn.png") },
    { id: 12, src: proxify("https://img.icons8.com/color/96/cat.png") },
    { id: 13, src: proxify("https://img.icons8.com/color/96/dog.png") },
    { id: 14, src: proxify("https://img.icons8.com/color/96/panda.png") },
    { id: 15, src: proxify("https://img.icons8.com/color/96/cherry.png") },
    { id: 16, src: proxify("https://img.icons8.com/color/96/crown.png") },
    { id: 17, src: proxify("https://img.icons8.com/color/96/dolphin.png") },
    { id: 18, src: proxify("https://img.icons8.com/color/96/rocket.png") },
    { id: 19, src: proxify("https://img.icons8.com/color/96/pizza.png") },
    { id: 20, src: proxify("https://img.icons8.com/color/96/cactus.png") },
    { id: 21, src: proxify("https://img.icons8.com/color/96/diamond.png") },
    { id: 22, src: proxify("https://img.icons8.com/color/96/gift.png") },
  ];

  // Add a sticker
  const addSticker = (src) => {
    const newSticker = {
      id: Date.now(),
      src,
      x: 0,
      y: 0,
      scale: 1,
      rotation: 0
    };
    setActiveStickers([...activeStickers, newSticker]);
    setSelectedStickerId(newSticker.id);
    toast.success("Sticker added! Click to select, drag to reposition.", { autoClose: 2000 });
  };

  // Drag stop handler
  const handleDragStop = (e, data, id) => {
    setActiveStickers((prev) =>
      prev.map((s) => (s.id === id ? { ...s, x: data.x, y: data.y } : s))
    );
  };

  // Resize and Rotate selected sticker
  const updateSelectedSticker = (property, value) => {
    if (!selectedStickerId) return;
    setActiveStickers((prev) =>
      prev.map((s) => (s.id === selectedStickerId ? { ...s, [property]: value } : s))
    );
  };

  // Load saved designs
  useEffect(() => {
    fetch(`http://localhost:5000/designs?type=${category}`)
      .then((res) => res.json())
      .then((data) => setSavedDesigns(data))
      .catch((err) => console.error("DB Load error:", err));
  }, [category]);

  const normalizeImage = (image) => {
    if (!image) return "";
    if (typeof image === "string" && image.startsWith("data:image")) return image;
    if (typeof image === "string" && (image.startsWith("http") || image.startsWith("/uploads"))) {
      if (image.startsWith("/")) return `http://localhost:5000${image}`;
      return image;
    }
    if (typeof image === "string") return `data:image/png;base64,${image}`;
    if (image.data) {
      const base64 = btoa(String.fromCharCode(...new Uint8Array(image.data)));
      return `data:image/png;base64,${base64}`;
    }
    return "";
  };

  // Save Template to database
  const handleSaveTemplate = () => {
    if (!productRef.current) return;

    toast.info("Saving design to templates...", { autoClose: 1500 });
    setSelectedStickerId(null); // Clear selection outline before capturing

    setTimeout(() => {
      toPng(productRef.current, { cacheBust: true, useCORS: true })
        .then((dataUrl) => {
          const newDesign = {
            title: category,
            description: prompt || `Custom ${category} design`,
            imageBase64: dataUrl,
            config: { color, pattern, stickers: activeStickers, aiImage, coasterShape }
          };

          // Save to database
          fetch("http://localhost:5000/designs", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newDesign),
          })
            .then((res) => res.json())
            .then((data) => {
              if (data.design) {
                setSavedDesigns([data.design, ...savedDesigns]);
                toast.success("Design saved to your templates!", { autoClose: 3000 });
              } else {
                toast.error("Failed to save design to DB.");
              }
            })
            .catch((err) => {
              console.error("DB Save error:", err);
              toast.error("DB Save failed.");
            });
        })
        .catch((err) => {
          console.error("Error generating PNG:", err);
          toast.error("Failed to save design image.");
        });
    }, 150);
  };

  // Download image locally
  const handleDownloadPNG = () => {
    if (!productRef.current) return;

    toast.info("Generating download image...", { autoClose: 1500 });
    setSelectedStickerId(null); // Clear selection outline before capturing

    setTimeout(() => {
      toPng(productRef.current, { cacheBust: true, useCORS: true })
        .then((dataUrl) => {
          const link = document.createElement("a");
          link.download = `${category}-design.png`;
          link.href = dataUrl;
          link.click();
          toast.success("Download started!");
        })
        .catch((err) => {
          console.error("Error generating PNG:", err);
          toast.error("Failed to download image.");
        });
    }, 150);
  };

  const loadDesign = (design) => {
    setColor(design.config?.color || "#ffffff");
    setActiveStickers(design.config?.stickers || []);
    if (design.config?.coasterShape) {
      setCoasterShape(design.config.coasterShape);
    }
    if (design.config?.pattern === "ai-generated") {
      setPattern("ai-generated");
      setAiImage(normalizeImage(design.config.aiImage || design.image));
    } else {
      setPattern(design.config?.pattern || "fabric");
      setAiImage(null);
    }
    toast.success("Loaded saved design!");
  };

  // Delete a saved design
  const handleDeleteDesign = (id) => {
    setSavedDesigns((prev) => prev.filter((d) => d._id !== id));
    fetch("http://localhost:5000/design/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          toast.success("Design deleted successfully.");
        } else {
          toast.error("Could not delete design.");
        }
      })
      .catch((err) => {
        console.error(err);
        toast.error("Failed to delete design.");
      });
  };

  // AI Image Generation
  const handleAIGenerate = () => {
    if (!prompt.trim()) return toast.warn("Please enter a description!");
    setAiLoading(true);
    toast.info("Generating artwork with AI...", { autoClose: 3000 });

    // Step 1: Try backend generation (which will use POLLINATIONS_API_KEY if present in .env)
    fetch("http://localhost:5000/ai/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Backend error: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        if (data.image) {
          const normalized = data.image.startsWith("data:image")
            ? data.image
            : `data:image/png;base64,${data.image}`;
          setAiImage(normalized);
          setPattern("ai-generated");
          toast.success("AI Art generated successfully!");
          setAiLoading(false);
        } else {
          throw new Error("No image data returned from backend");
        }
      })
      .catch((err) => {
        console.warn("Backend AI generation failed, falling back to frontend direct fetch...", err.message);
        
        // Step 2: Fallback to direct frontend keyless fetch
        const encodedPrompt = encodeURIComponent(prompt.trim());
        const randomSeed = Math.floor(Math.random() * 10000000);
        const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&seed=${randomSeed}&nologo=true`;

        const tempImg = new Image();
        tempImg.crossOrigin = "anonymous";
        
        tempImg.onload = () => {
          setAiImage(imageUrl);
          setPattern("ai-generated");
          toast.success("AI Art generated successfully via keyless fallback!");
          setAiLoading(false);
        };

        tempImg.onerror = () => {
          console.error("Frontend direct fetch failed as well for prompt:", prompt);
          toast.error(
            "AI generation failed. To enable high-speed AI art, please create a free key at enter.pollinations.ai and add POLLINATIONS_API_KEY to your backend .env file.",
            { autoClose: 8000 }
          );
          setAiLoading(false);
        };

        tempImg.src = imageUrl;
      });
  };

  // Dynamic header details
  const headerContent = {
    towel: { title: "Towel Customizer", subtitle: "Design your custom woven towel with fringes and premium patterns" },
    bag: { title: "Tote Bag Customizer", subtitle: "Stylize your modern canvas tote bag with custom textures and AI art" },
    paperfile: { title: "Paper File Customizer", subtitle: "Design office document folders and office folders with corporate art" },
    napkin: { title: "Napkin Customizer", subtitle: "Customize cloth dining napkins with decorative stitched borders" },
    bedsheet: { title: "Bedsheet Customizer", subtitle: "Design gorgeous cotton bedsheets with custom prints and AI layouts" },
    cupcoaster: { title: "Cup Coaster Customizer", subtitle: "Stylize circular, square, hexagonal or triangular table coasters" },
    bamboo: { title: "Bamboo Customizer", subtitle: "Design eco-friendly bamboo wood items, photo frames, and customized bamboo prints" }
  }[category] || { title: "Product Customizer", subtitle: "Customize your product with colors, patterns, and AI generation" };

  return (
    <div className="universal-customizer-wrapper">
      <div className="customizer-container">
        {/* Left Toolbar - Colors & Textures */}
        <div className="customizer-panel left-panel">
          <div className="panel-section">
            <h4>🎨 Base Color</h4>
            <div className="color-section-inner">
              <input
                type="color"
                className="base-color-picker"
                value={color}
                onChange={(e) => setColor(e.target.value)}
              />
              <span className="color-hex-label">{color}</span>
            </div>
          </div>

          <div className="panel-section">
            <h4>🖌 repeating Patterns</h4>
            <div className="pattern-grid">
              {patterns.map((p) => (
                <button
                  key={p.value}
                  className={`pattern-btn ${pattern === p.value ? "active" : ""}`}
                  onClick={() => {
                    setPattern(p.value);
                    setAiImage(null);
                  }}
                  style={{
                    backgroundImage: `url(${p.preview})`,
                    backgroundSize: "cover"
                  }}
                  title={p.label}
                />
              ))}
              {aiImage && (
                <button
                  className={`pattern-btn ai-preview-btn ${pattern === "ai-generated" ? "active" : ""}`}
                  onClick={() => setPattern("ai-generated")}
                  style={{
                    backgroundImage: `url(${aiImage})`,
                    backgroundSize: "cover"
                  }}
                  title="AI Generated"
                />
              )}
            </div>
          </div>

          {category === "cupcoaster" && (
            <div className="panel-section">
              <h4>📐 Coaster Shape</h4>
              <div className="shape-picker-tabs">
                {["circle", "square", "hexagon", "triangle"].map((shape) => (
                  <button
                    key={shape}
                    className={`shape-tab-btn ${coasterShape === shape ? "active" : ""}`}
                    onClick={() => setCoasterShape(shape)}
                  >
                    {shape.charAt(0).toUpperCase() + shape.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="panel-section">
            <h4>🌟 Add Stickers</h4>
            <div className="sticker-list-grid">
              {stickers.map((s) => (
                <button
                  key={s.id}
                  className="sticker-thumb-btn"
                  onClick={() => addSticker(s.src)}
                >
                  <img src={s.src} alt="sticker" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Center - Visual Mockup Canvas */}
        <div className="mockup-canvas-area">
          <div className="mockup-header-card">
            <h2>{headerContent.title}</h2>
            <p>{headerContent.subtitle}</p>
          </div>

          {/* Prompt AI generator */}
          <div className="ai-generator-panel">
            <input
              type="text"
              placeholder="Describe your design to the AI (e.g. Celestial stars and moons in pastel indigo watercolors)..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="ai-prompt-textarea"
            />
            <button
              className="ai-generate-action-btn"
              onClick={handleAIGenerate}
              disabled={aiLoading}
            >
              {aiLoading ? (
                <>
                  <span className="spinner-dots" /> Generating Art...
                </>
              ) : (
                "✨ AI Generate"
              )}
            </button>
          </div>

          <div className="canvas-outer-frame">
            {/* The main container to capture */}
            <div
              ref={productRef}
              className={`product-mockup-canvas category-${category} shape-${coasterShape}`}
              style={{
                backgroundColor: color,
                backgroundImage:
                  pattern !== "ai-generated"
                    ? `url(${patterns.find((p) => p.value === pattern)?.preview})`
                    : "none",
                backgroundSize: "120px 120px",
                backgroundRepeat: "repeat"
              }}
            >
              {/* AI Image Overlay */}
              {pattern === "ai-generated" && aiImage && (
                <img
                  src={aiImage}
                  alt="AI Texture"
                  className="canvas-ai-bg-layer"
                  crossOrigin="anonymous"
                />
              )}

              {/* Towel Decorative Fringes Mockup */}
              {category === "towel" && (
                <>
                  <div className="towel-fringe top-fringe">
                    {Array(36).fill(0).map((_, i) => <span key={i} style={{ backgroundColor: color }} />)}
                  </div>
                  <div className="towel-fringe bottom-fringe">
                    {Array(36).fill(0).map((_, i) => <span key={i} style={{ backgroundColor: color }} />)}
                  </div>
                </>
              )}

              {/* Tote Bag Handles & Silhouette Mask Mockup */}
              {category === "bag" && (
                <div className="tote-bag-mockup-overlay">
                  <div className="tote-handles">
                    <svg viewBox="0 0 100 50" className="handles-svg">
                      <path d="M20,50 C20,10 80,10 80,50" fill="none" stroke="#2a2a2a" strokeWidth="6" />
                    </svg>
                  </div>
                  <div className="tote-stitchings">
                    <div className="stitch-line line-left" />
                    <div className="stitch-line line-right" />
                    <div className="stitch-line line-bottom" />
                  </div>
                </div>
              )}

              {/* Document Folder / Paper File Mockup */}
              {category === "paperfile" && (
                <div className="paperfile-mockup-overlay">
                  <div className="folder-tab" style={{ backgroundColor: color }} />
                  <div className="folder-crease-shadow" />
                  <div className="folder-metal-clip">
                    <span className="clip-plate" />
                    <span className="clip-bar" />
                  </div>
                </div>
              )}

              {/* Bedsheet Shadow & Creases Mockup */}
              {category === "bedsheet" && (
                <div className="bedsheet-mockup-overlay">
                  <div className="crease crease-1" />
                  <div className="crease crease-2" />
                  <div className="fabric-gloss-shine" />
                </div>
              )}

              {/* Napkin Hem Stitched Mockup */}
              {category === "napkin" && (
                <div className="napkin-mockup-overlay">
                  <div className="hem-stitching" />
                </div>
              )}

              {/* Bamboo Wood Frame / Eco Silhouette Mockup */}
              {category === "bamboo" && (
                <div className="bamboo-mockup-overlay">
                  <div className="bamboo-frame-border" />
                  <div className="bamboo-wood-grain-overlay" />
                </div>
              )}

              {/* Draggable Active Stickers */}
              {activeStickers.map((sticker) => (
                <Draggable
                  key={sticker.id}
                  bounds="parent"
                  position={{ x: sticker.x, y: sticker.y }}
                  onStop={(e, data) => handleDragStop(e, data, sticker.id)}
                >
                  <div
                    className={`draggable-sticker-container ${selectedStickerId === sticker.id ? "selected" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedStickerId(sticker.id);
                    }}
                    onDoubleClick={(e) => {
                      e.stopPropagation();
                      setActiveStickers(activeStickers.filter((s) => s.id !== sticker.id));
                      setSelectedStickerId(null);
                      toast.info("Sticker removed.");
                    }}
                    style={{
                      transform: `scale(${sticker.scale}) rotate(${sticker.rotation}deg)`,
                      cursor: "grab",
                      position: "absolute",
                      zIndex: 10
                    }}
                  >
                    <img
                      src={sticker.src}
                      alt="sticker"
                      draggable={false}
                      className="canvas-placed-sticker"
                    />
                  </div>
                </Draggable>
              ))}
            </div>
          </div>

          {/* Sticker Controls panel */}
          {selectedStickerId && (
            <div className="sticker-transform-controls">
              <h5>📐 Edit Selected Sticker</h5>
              <div className="sliders-row">
                <div className="slider-group">
                  <label>Size</label>
                  <input
                    type="range"
                    min="0.4"
                    max="2.5"
                    step="0.1"
                    value={activeStickers.find(s => s.id === selectedStickerId)?.scale || 1}
                    onChange={(e) => updateSelectedSticker("scale", parseFloat(e.target.value))}
                  />
                </div>
                <div className="slider-group">
                  <label>Rotate</label>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    step="5"
                    value={activeStickers.find(s => s.id === selectedStickerId)?.rotation || 0}
                    onChange={(e) => updateSelectedSticker("rotation", parseInt(e.target.value))}
                  />
                </div>
                <button
                  className="sticker-remove-btn"
                  onClick={() => {
                    setActiveStickers(activeStickers.filter(s => s.id !== selectedStickerId));
                    setSelectedStickerId(null);
                    toast.info("Sticker removed.");
                  }}
                >
                  🗑️ Remove
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar - Save / Download / Saved Templates */}
        <div className="customizer-panel right-panel">
          <div className="panel-section">
            <h4>💾 Export Design</h4>
            <button className="primary-action-btn" onClick={handleSaveTemplate}>
              💾 Save Template
            </button>
            <button className="secondary-action-btn" onClick={handleDownloadPNG} style={{ marginTop: "8px" }}>
              📥 Download PNG
            </button>
          </div>

          <div className="panel-section flex-fill">
            <h4>📂 Saved Templates</h4>
            <div className="saved-templates-gallery">
              {savedDesigns.length === 0 ? (
                <div className="empty-gallery-msg">No saved designs.</div>
              ) : (
                savedDesigns.map((design) => (
                  <div key={design._id} className="template-card">
                    <img
                      src={normalizeImage(design.image)}
                      alt="design thumbnail"
                      className="template-thumb"
                      onClick={() => loadDesign(design)}
                    />
                    <button
                      className="template-delete-btn"
                      onClick={() => handleDeleteDesign(design._id)}
                      title="Delete design"
                    >
                      🗑️
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
