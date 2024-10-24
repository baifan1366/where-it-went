import { Feather } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { FlatList, SafeAreaView, Text, TextInput, TouchableOpacity, View } from 'react-native';

import useFinanceStore from '@/core/hooks/use-finance-store';
import { type Category } from '@/types';

export default function Add() {
  const [calculation, setCalculation] = useState('0');
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | number | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showCalculator, setShowCalculator] = useState(true);

  const { getCategoriesByUserId, createTransaction } = useFinanceStore();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const userId = '16d34515-f8c9-466f-acdb-34700deb1214'; // Replace with actual user ID
        const fetchedCategories = await getCategoriesByUserId(userId);
        setCategories(fetchedCategories);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  });

  const handleCategorySelect = (categoryId: string | number) => {
    setSelectedCategory(categoryId);
  };

  const handleCalculatorInput = (value: string) => {
    if (value === 'C') {
      setCalculation('0');
    } else if (value === '=') {
      try {
        const result = eval(calculation);
        setCalculation(parseFloat(result).toFixed(2));
      } catch (error) {
        setCalculation('Error');
      }
    } else if (['+', '-', '*', '/'].includes(value)) {
      setCalculation(prev => `${prev} ${value} `);
    } else if (value === '.') {
      if (!calculation.includes('.')) {
        setCalculation(prev => `${prev}${value}`);
      }
    } else {
      setCalculation(prev => prev === '0' ? value : `${prev}${value}`);
    }
  };

  const handleSubmit = async () => {
    if (!selectedCategory || calculation === 'Error') return;

    try {
      const finalAmount = parseFloat(calculation);
      await createTransaction({
        user_id: '16d34515-f8c9-466f-acdb-34700deb1214', // Replace with actual user ID
        category_id: selectedCategory.toString(),
        amount: finalAmount,
        type: 'expense', // Assuming all transactions are expenses in this simplified version
        description: description,
        date: new Date().toISOString().split('T')[0],
      });
      // Reset form
      setCalculation('0');
      setDescription('');
      setSelectedCategory(null);
    } catch (error) {
      console.error('Error creating transaction:', error);
    }
  };

  const renderCategoryItem = ({ item }: { item: Category }) => (
    <TouchableOpacity
      className={`m-1 items-center justify-center rounded-lg p-2 ${
        selectedCategory === item.id ? 'bg-yellow-200' : 'bg-white'
      }`}
      onPress={() => handleCategorySelect(item.id)}
    >
      <Text className="text-2xl">{item.icon}</Text>
      <Text className="text-center text-xs">{item.name}</Text>
    </TouchableOpacity>
  );

  const calculatorButtons = [
    '7', '8', '9', '+',
    '4', '5', '6', '-',
    '1', '2', '3', '*',
    'C', '0', '.', '/'
  ];

  return (
    <SafeAreaView className="flex-1 bg-yellow-100">
      <View className="flex-1 p-4">
        <FlatList
          data={categories}
          renderItem={renderCategoryItem}
          keyExtractor={(item) => item.id.toString()}
          numColumns={4}
          className="mb-4"
        />
        <View className="flex-1 justify-end">
          <View className="relative rounded-t-3xl bg-gray-100 p-4">
            <TouchableOpacity 
              onPress={() => setShowCalculator(!showCalculator)}
              className="absolute right-2 top--4 z-10 rounded-full bg-yellow-400 p-1"
            >
              <Feather name={showCalculator ? "chevron-down" : "chevron-up"} size={25} color="white" />
            </TouchableOpacity>
            <TextInput
              className="mb-4 rounded-lg bg-white p-4"
              placeholder="Enter description"
              value={description}
              onChangeText={setDescription}
            />
            <Text className="mb-2 text-right text-3xl">{calculation}</Text>
            {showCalculator && (
              <View>
                <View className="flex-row flex-wrap justify-between">
                  {calculatorButtons.map((button) => (
                    <TouchableOpacity
                      key={button}
                      className="m-1 aspect-square w-[23%] items-center justify-center rounded-full bg-white"
                      onPress={() => handleCalculatorInput(button)}
                    >
                      <Text className="text-2xl">{button}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <View className="mt-2 flex-row justify-between">
                  <TouchableOpacity
                    className="mr-2 flex-1 items-center justify-center rounded-full bg-yellow-400 py-4"
                    onPress={() => handleCalculatorInput('=')}
                  >
                    <Text className="text-2xl text-white">=</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="ml-2 flex-1 items-center justify-center rounded-full bg-blue-500 py-4"
                    onPress={handleSubmit}
                  >
                    <Text className="text-lg font-bold text-white">Add Transaction</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}