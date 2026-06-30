# 🛡️ FallGuard - Monitor de Quedas

Um aplicativo moderno construído com React Native e Expo que utiliza os sensores do seu smartphone para detectar movimentos bruscos e possíveis quedas, emitindo alertas locais e feedbacks visuais em tempo real. 

O app possui uma interface imersiva no estilo **High-Tech Dark**, focada em legibilidade e performance.

---

## 🛠️ Tecnologias Utilizadas

* **React Native:** Framework principal da interface.
* **Expo:** Plataforma e ferramentas de desenvolvimento.
* **Expo Sensors:** Para leitura contínua do acelerômetro.
* **Expo Notifications:** Para agendamento e disparo de alertas no dispositivo.
* **Expo Haptics:** Para feedback tátil e vibrações avançadas.

---

## 📱 Pré-requisitos

Antes de começar, você precisará ter as seguintes ferramentas instaladas:

1. **Node.js:** Instalado em seu computador (versão LTS recomendada).
2. **Aplicativo Expo Go:** Instalado no seu celular físico (disponível gratuitamente na App Store para iOS ou Google Play para Android).

---

## 🚀 Como Instalar e Rodar o Projeto

Siga os passos abaixo no terminal do seu computador:

1. Inicialize um novo projeto Expo**

npx create-expo-app fallguard
cd fallguard
 
---
2. Instale as dependências extras
npx expo install expo-sensors expo-notifications expo-haptics

---
3 Inicie o servidor de desenvolvimento
npx expo start
---

Conecte pelo Expo Go apontando a câmera do celular para o QR Code gerado no terminal.