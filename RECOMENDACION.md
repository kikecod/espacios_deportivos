# 🏟️ Sistema de Recomendación Basado en Contenido – Reservas de Espacios Deportivos

Este documento describe el **contexto teórico y matemático** de un sistema de recomendación basado en contenido, aplicado a una **plataforma de reservas de espacios deportivos inspirada en Airbnb**.

---

## 🎯 Contexto del Sistema

El sistema tiene como objetivo recomendar **espacios deportivos** (canchas, gimnasios, centros recreativos, etc.) a los usuarios según sus **preferencias previas** y las **características de los espacios disponibles**.

Por ejemplo:
> Si un usuario ha reservado una *cancha de fútbol 5 en la zona sur, con vestuarios e iluminación nocturna*, el sistema le recomendará **otros espacios similares** en base a esos atributos.

---

## 🧩 Componentes Principales

### 1. Perfil del Usuario
Representa las preferencias del usuario, construidas a partir de los espacios que ha reservado o valorado positivamente.

**Ejemplo de atributos:**
- Tipo de deporte: Fútbol 5, Básquet, Tenis
- Precio promedio
- Valoración promedio
- Zona
- Servicios: Iluminación, Vestuarios, Parqueo

### 2. Perfil del Espacio Deportivo
Representa los atributos del espacio que pueden influir en una reserva.

**Ejemplo:**
| Atributo | Valor |
|-----------|--------|
| Tipo de deporte | Fútbol 5 |
| Superficie | Césped sintético |
| Precio por hora | 60 Bs |
| Zona | Miraflores |
| Servicios | Iluminación, Vestuarios, Parqueo |
| Valoración promedio | 4.7 ⭐ |

---

## ⚙️ Etapas del Sistema de Recomendación

### **1️⃣ Extracción de características**
Se analizan los espacios deportivos y se extraen sus principales atributos (numéricos y categóricos).

### **2️⃣ Modelado de perfiles**
Los atributos se convierten en **vectores**:
- Atributos **numéricos o continuos** (precio, valoración, distancia)
- Atributos **binarios o categóricos** (servicios, tipo de superficie, zona)

### **3️⃣ Cálculo de similitud**
Se calculan los valores de similitud entre el perfil del usuario y cada espacio deportivo usando dos métodos:  
**Similitud del Coseno** y **Similitud de Jaccard**.

---

## 🧮 Fórmulas Matemáticas

### **1. Similitud del Coseno**
Mide la semejanza entre dos vectores numéricos.  
Es ideal para atributos **continuos** (precio, valoración, distancia, etc.).

\[
\text{Similitud}_{\text{Coseno}} = \frac{A \cdot B}{\|A\| \|B\|}
\]

Donde:
- \( A \) → Vector del usuario  
- \( B \) → Vector del espacio deportivo  
- \( A \cdot B \) → Producto punto de los vectores  
- \( \|A\| \) y \( \|B\| \) → Magnitudes de los vectores  

**Ejemplo:**
\[
A = [0.8, 0.9, 1.0], \quad B = [0.7, 0.85, 0.9]
\]
\[
\text{Similitud}_{\text{Coseno}} = \frac{2.225}{1.565 \times 1.433} = 0.993
\]

✅ Resultado: **0.99 → Muy alta similitud**

---

### **2. Similitud de Jaccard**
Mide la proporción de atributos **categóricos o binarios** compartidos entre el usuario y el espacio.

\[
\text{Similitud}_{\text{Jaccard}} = \frac{|A \cap B|}{|A \cup B|}
\]

Donde:
- \( |A \cap B| \): Número de atributos comunes  
- \( |A \cup B| \): Número total de atributos  

**Ejemplo:**
| Atributo | Usuario | Espacio |
|-----------|----------|----------|
| Iluminación | ✅ | ✅ |
| Vestuarios | ✅ | ✅ |
| Parqueo | ✅ | ❌ |
| Cafetería | ❌ | ✅ |
| Superficie sintética | ✅ | ✅ |

\[
|A \cap B| = 3, \quad |A \cup B| = 5
\]
\[
\text{Similitud}_{\text{Jaccard}} = \frac{3}{5} = 0.6
\]

✅ Resultado: **0.6 → Similitud media**

---

### **3. Combinación de ambas métricas**

La similitud total se obtiene combinando ambos métodos con **pesos α y β**, que representan la importancia relativa de los atributos **numéricos** y **categóricos**.

\[
\text{Similitud Total} = \alpha \times \text{Similitud}_{\text{Coseno}} + \beta \times \text{Similitud}_{\text{Jaccard}}
\]

Condición:  
\[
\alpha + \beta = 1
\]

**Valores recomendados para este sistema:**
\[
\alpha = 0.6 \quad (\text{atributos numéricos})
\]
\[
\beta = 0.4 \quad (\text{atributos categóricos})
\]

---

### **Ejemplo combinado**

| Espacio | Coseno | Jaccard | Total (0.6×Cos + 0.4×Jac) | Resultado |
|----------|---------|----------|----------------|------------|
| Cancha A | 0.99 | 0.60 | 0.846 | ✅ Muy recomendada |
| Cancha B | 0.75 | 0.80 | 0.77 | 👍 Recomendable |
| Cancha C | 0.50 | 0.40 | 0.46 | ⚪ Poco relevante |

---

## 📈 Interpretación

- Los espacios con **mayor similitud total** se muestran primero como recomendación.  
- Los pesos **α y β** pueden ajustarse según el comportamiento real de los usuarios:
  - Si los usuarios priorizan **precio y valoración**, aumentar α.  
  - Si priorizan **tipo de deporte o servicios**, aumentar β.



