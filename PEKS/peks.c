#include <pbc.h>
#include <stdio.h>
#include <string.h>
#include <stdlib.h> 

// --- Funciones de Ayuda para Conversión ---
// Convierten los elementos criptográficos a texto (hexadecimal) y viceversa
char* element_to_hex(element_t el) {
    int len = element_length_in_bytes(el);
    unsigned char *buf = (unsigned char*)malloc(len);
    element_to_bytes(buf, el);
    char *hex_str = (char*)malloc(len * 2 + 1);
    for(int i = 0; i < len; i++) {
        sprintf(hex_str + (i * 2), "%02x", buf[i]);
    }
    free(buf);
    return hex_str;
}

void element_from_hex(element_t el, char *hex_str) {
    int len = strlen(hex_str) / 2;
    unsigned char *buf = (unsigned char*)malloc(len);
    for(int i = 0; i < len; i++) {
        sscanf(hex_str + (i * 2), "%2hhx", &buf[i]);
    }
    element_from_bytes(el, buf);
    free(buf);
}

// --- Lógica Criptográfica ---

void setup(pairing_t pairing, const char* pk_path, const char* sk_path) {
    element_t g, pk, sk;
    element_init_G1(g, pairing);
    element_init_G1(pk, pairing);
    element_init_Zr(sk, pairing);
    element_random(g);
    element_random(sk);
    element_pow_zn(pk, g, sk);

    FILE *pk_file = fopen(pk_path, "w");
    FILE *sk_file = fopen(sk_path, "w");
    char* g_hex = element_to_hex(g);
    char* pk_hex = element_to_hex(pk);
    char* sk_hex = element_to_hex(sk);
    fprintf(pk_file, "%s\n%s\n", g_hex, pk_hex);
    fprintf(sk_file, "%s\n", sk_hex);
    fclose(pk_file);
    fclose(sk_file);
    free(g_hex); free(pk_hex); free(sk_hex);
    element_clear(g); element_clear(pk); element_clear(sk);
    printf("✅ Claves generadas en '%s' y '%s'\n", pk_path, sk_path);
}

void encrypt_keyword(char *keyword, pairing_t pairing, const char* pk_path) {
    FILE *pk_file = fopen(pk_path, "r");
    char g_hex[1024], pk_hex[1024];
    fscanf(pk_file, "%s\n%s", g_hex, pk_hex);
    fclose(pk_file);

    element_t g, pk, H1_kw, C;
    element_init_G1(g, pairing);
    element_init_G1(pk, pairing);
    element_init_G1(H1_kw, pairing);
    element_init_GT(C, pairing);
    element_from_hex(g, g_hex);
    element_from_hex(pk, pk_hex);
    element_from_hash(H1_kw, keyword, strlen(keyword));
    pairing_apply(C, H1_kw, pk, pairing);

    char* c_hex = element_to_hex(C);
    printf("%s\n", c_hex); // Imprime solo el resultado
    free(c_hex);
    element_clear(g); element_clear(pk); element_clear(H1_kw); element_clear(C);
}

void generate_trapdoor(char *keyword, pairing_t pairing, const char* sk_path) {
    FILE *sk_file = fopen(sk_path, "r");
    char sk_hex[1024];
    fscanf(sk_file, "%s", sk_hex);
    fclose(sk_file);

    element_t sk, H1_kw, T;
    element_init_Zr(sk, pairing);
    element_init_G1(H1_kw, pairing);
    element_init_G1(T, pairing);
    element_from_hex(sk, sk_hex);
    element_from_hash(H1_kw, keyword, strlen(keyword));
    element_pow_zn(T, H1_kw, sk);

    char* t_hex = element_to_hex(T);
    printf("%s\n", t_hex); // Imprime solo el resultado
    free(t_hex);
    element_clear(sk); element_clear(H1_kw); element_clear(T);
}

void test(char* C_hex, char* T_hex, pairing_t pairing, const char* pk_path) {
    FILE *pk_file = fopen(pk_path, "r");
    char g_hex[1024], pk_hex[1024];
    fscanf(pk_file, "%s\n%s", g_hex, pk_hex);
    fclose(pk_file);

    element_t g, C, T, lhs, rhs;
    element_init_G1(g, pairing);
    element_init_GT(C, pairing);
    element_init_G1(T, pairing);
    element_init_GT(lhs, pairing);
    element_init_GT(rhs, pairing);

    element_from_hex(g, g_hex);
    element_from_hex(C, C_hex);
    element_from_hex(T, T_hex);

    element_set(lhs, C);
    pairing_apply(rhs, T, g, pairing);

    if (!element_cmp(lhs, rhs)) {
        printf("MATCH\n");
    } else {
        printf("NO_MATCH\n");
    }
    element_clear(g); element_clear(C); element_clear(T); element_clear(lhs); element_clear(rhs);
}

// --- Función Principal ---
int main(int argc, char **argv) {
    if (argc < 2) {
        fprintf(stderr, "Uso: %s <comando> [argumentos...]\n", argv[0]);
        return 1;
    }

    char *command = argv[1];
    FILE *param_file = fopen(argv[2], "r");
    char param[2048];
    size_t count = fread(param, 1, 2048, param_file);
    fclose(param_file);
    pairing_t pairing;
    pairing_init_set_buf(pairing, param, count);

    if (strcmp(command, "setup") == 0) {
        setup(pairing, argv[3], argv[4]);
    } else if (strcmp(command, "encrypt") == 0) {
        encrypt_keyword(argv[4], pairing, argv[3]);
    } else if (strcmp(command, "trapdoor") == 0) {
        generate_trapdoor(argv[4], pairing, argv[3]);
    } else if (strcmp(command, "test") == 0) {
        test(argv[3], argv[4], pairing, argv[5]);
    } else {
        fprintf(stderr, "Comando desconocido: '%s'\n", command);
    }

    pairing_clear(pairing);
    return 0;
}
